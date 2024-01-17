import { file } from 'bun';
import { join } from 'node:path';

const [, , workspace, script] = process.argv;

const runScriptForWorkspace = (w: string) =>
  new Promise<number>((resolve, reject) => {
    console.info(`Running script "${script}" in workspace "${w}"`);
    Bun.spawn({
      cmd: ['bun', 'run', script],
      cwd: `./${w}`,
      stdio: ['inherit', 'inherit', 'inherit'],
      onExit(info) {
        if (info.exitCode !== 0) {
          console.log('The script failed', info.exitCode);
          reject(info.exitCode);
        } else {
          console.log('The script ran successfully');
          resolve(info.exitCode);
        }
      },
    });
  });

if (workspace.includes(',')) {
  const workspaces = workspace.split(',');
  for (const w of workspaces) {
    runScriptForWorkspace(w);
  }
} else if (workspace !== 'all' && !workspace.startsWith('-'))
  runScriptForWorkspace(workspace);
else {
  const excluded = workspace.startsWith('-') && workspace.slice(1);

  const packageJson = JSON.parse(
    await file(join(import.meta.dir, '../package.json')).text(),
  );

  const workspaces = packageJson.workspaces as string[];
  for (const w of workspaces) {
    if (w === excluded) continue;
    await runScriptForWorkspace(w);
  }
}
