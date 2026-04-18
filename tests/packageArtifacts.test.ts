import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const rootDir = resolve(__dirname, '..');

test('package metadata points at built artifacts', () => {
  const packageJson = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8')) as {
    files: string[];
    main: string;
    'react-native': string;
    types: string;
  };

  assert.equal(packageJson.main, './dist/index.js');
  assert.equal(packageJson['react-native'], './dist/index.js');
  assert.equal(packageJson.types, './dist/index.d.ts');
  assert.deepEqual(packageJson.files, ['dist', 'LICENSE', 'README.md']);

  assert.equal(existsSync(resolve(rootDir, 'dist/index.js')), true);
  assert.equal(existsSync(resolve(rootDir, 'dist/index.d.ts')), true);
});
