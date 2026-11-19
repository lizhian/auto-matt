// 固定候选版本的命令执行器。源自 suntianc/paseo-matt-workloop，见 LICENSE。
import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { closeSync, openSync, realpathSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CHECK_RUNNER = fileURLToPath(new URL("./check-run.mjs", import.meta.url));
const WIN = process.platform === "win32";
const alive = (pid) => {
  try { process.kill(pid, 0); return true; } catch (error) { return error.code === "EPERM"; }
};

const tail = (s, n) => s.split("\n").slice(-n).join("\n");
const groupExists = (pgid) => { try { process.kill(-pgid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
const checkRunning = (pid, win = WIN) => (win ? alive(pid) : groupExists(pid));
const stopWhat = (pid, win = WIN) => (win ? `pid ${pid}` : `process group ${pid}`);
function signalCheck(pid, win = WIN) {
  if (win) {
    let r;
    r = spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { encoding: "utf8" });
    return r.status === 0 ? { ok: true } : { ok: false, error: `taskkill exited ${r.status}: ${r.error?.message || r.stderr || r.stdout}` };
  }
  try { process.kill(-pid, "SIGKILL"); } catch (e) {
    if (e.code !== "ESRCH") return { ok: false, error: `kill(-${pid}, SIGKILL): ${e.code || e.message}` };
  }
  return { ok: true };
}
const STOP_CONFIRM_MS = 5000;
async function stopCheck(pid) {
  const r = signalCheck(pid);
  if (!r.ok) return r;
  for (const end = Date.now() + STOP_CONFIRM_MS; checkRunning(pid);) {
    if (Date.now() > end) return { ok: false, error: `${stopWhat(pid)} still exists ${STOP_CONFIRM_MS / 1000} s after it was killed` };
    await new Promise((done) => setTimeout(done, 50));
  }
  return { ok: true };
}
export function runOneCheck(cmd, cwd, limitMs, onSpawn, logPath) {
  return new Promise((resolve) => {
    const logFd = logPath ? openSync(logPath, "wx", 0o600) : null;
    let logError;
    const token = `wl-check-${randomUUID()}`;
    // Detached on every platform: on POSIX the wrapper leads its own process group;
    // on Windows it stays out of this process's job object, which would otherwise
    // end the wrapper with an interrupted owner and strand its tree beyond recovery.
    const child = spawn(process.execPath, [CHECK_RUNNER, token, cmd], { cwd, detached: true, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    let output = "";
    let settled = false;
    let ending = false; // the wrapper exited or the limit expired; cleanup decides the result
    let closed = false;
    let result = null;
    let grace;
    const collect = (d) => {
      output = (output + d).slice(-(1 << 20));
      if (logFd !== null && !logError) {
        try { writeFileSync(logFd, d); } catch (e) { logError = e.message; }
      }
    };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    child.stdin.on("error", () => { /* the wrapper exited; its exit is reported below */ });
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(grace);
      child.stdout.destroy();
      child.stderr.destroy();
      child.unref(); // a check whose stop failed must not keep this process alive
      if (logFd !== null) {
        try { closeSync(logFd); } catch (e) { logError ??= e.message; }
      }
      if (logError) { output += `\ncheck log failed: ${logError}`; result = { ...result, ok: false, logError }; }
      resolve({ exitCode: null, signal: null, ...result, output: tail(output.trim(), 40) });
    };
    // Whether the limit expires or the wrapper exits (normally, crashed or
    // killed), the check is settled only once its group is confirmed gone,
    // survivors stopped; a failed stop is part of the result, so the caller keeps
    // the phase for recovery. Windows has no group to sweep after an exit.
    const cleanUp = async (timedOut, ok) => {
      const stop = timedOut || !WIN ? await stopCheck(child.pid) : { ok: true };
      if (!stop.ok) output += `\ncleanup failed: ${stop.error}`;
      return { ok: ok && stop.ok, ...(timedOut && { timedOut }), ...(stop.ok ? {} : { cleanupFailed: { pid: child.pid, token, error: stop.error } }) };
    };
    const timer = setTimeout(async () => {
      if (ending) return;
      ending = true;
      finish(await cleanUp(true, false));
    }, limitMs);
    child.on("error", (e) => { output += `\n${e.message}`; if (!ending) finish({ ok: false }); });
    child.on("exit", async (code, signal) => {
      if (ending) return;
      ending = true;
      clearTimeout(timer);
      result = { ...await cleanUp(false, code === 0), exitCode: code, signal };
      if (closed) return finish(result);
      grace = setTimeout(() => finish(result), 1000); // a pipe a stopped process held may close late
    });
    child.on("close", () => { closed = true; if (result) finish(result); });
    if (!child.pid) return;
    try { onSpawn?.(child.pid, token); } catch (e) {
      // Closing stdin without "go" ends the wrapper before the command starts.
      child.stdin.end();
      output += `\nnot run: ${e.message}`;
      return finish({ ok: false });
    }
    child.stdin.end("go\n");
  });
}
export function isMain(metaUrl) {
  if (!process.argv[1]) return false;
  try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(metaUrl)); } catch { return false; }
}
