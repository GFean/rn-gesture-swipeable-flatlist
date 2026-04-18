import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = resolve(rootDir, 'tests');

const getTestFiles = (directoryPath) =>
  readdirSync(directoryPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return getTestFiles(entryPath);
    }

    return /\.test\.tsx?$/.test(entry.name) ? [relative(rootDir, entryPath)] : [];
  });

const testFiles = getTestFiles(testsDir).sort((left, right) => left.localeCompare(right));
const nodeArgs = ['--import', 'tsx', '--test', ...testFiles];

const result = spawnSync(process.execPath, nodeArgs, {
  cwd: rootDir,
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
