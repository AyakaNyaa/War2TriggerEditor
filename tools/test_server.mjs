import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const root = fileURLToPath(new URL('../', import.meta.url));
const local = join(root, '.local');
mkdirSync(local, { recursive: true });
const child = spawn(join(root, 'target/debug/war2-editor.exe'), ['--headless'], {
  cwd: root,
  env: { ...process.env, WAR2_PORT: '47862', WAR2_RECOVERY_DIR: join(local, 'qa-recovery') },
  stdio: 'inherit', windowsHide: true,
});
child.on('exit', (code) => process.exit(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { child.kill(); process.exit(0); });
}
process.on('exit', () => child.kill());
