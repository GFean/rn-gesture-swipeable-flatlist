import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const rootDir = resolve(__dirname, '..');

test('package metadata points at built artifacts', () => {
  const packageJson = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8')) as {
    files: string[];
    main: string;
    peerDependencies: Record<string, string>;
    peerDependenciesMeta: Record<string, { optional?: boolean }>;
    'react-native': string;
    types: string;
  };

  assert.equal(packageJson.main, './dist/index.js');
  assert.equal(packageJson['react-native'], './dist/index.js');
  assert.equal(packageJson.types, './dist/index.d.ts');
  assert.deepEqual(packageJson.files, [
    'dist',
    'reanimated.js',
    'reanimated.d.ts',
    'LICENSE',
    'README.md',
  ]);
  assert.equal(packageJson.peerDependencies['react-native-reanimated'], '>=2.3.0');
  assert.equal(packageJson.peerDependenciesMeta['react-native-reanimated']?.optional, true);

  assert.equal(existsSync(resolve(rootDir, 'dist/index.js')), true);
  assert.equal(existsSync(resolve(rootDir, 'dist/index.d.ts')), true);
  assert.equal(existsSync(resolve(rootDir, 'dist/reanimated.js')), true);
  assert.equal(existsSync(resolve(rootDir, 'dist/reanimated.d.ts')), true);
  assert.equal(existsSync(resolve(rootDir, 'dist/swipeableRowAdapters.js')), false);
  assert.equal(existsSync(resolve(rootDir, 'reanimated.js')), true);
  assert.equal(existsSync(resolve(rootDir, 'reanimated.d.ts')), true);

  const legacyBundle = readFileSync(resolve(rootDir, 'dist/index.js'), 'utf8');
  const reanimatedAdapterBundle = readFileSync(
    resolve(rootDir, 'dist/ReanimatedSwipeableRowAdapter.js'),
    'utf8'
  );

  assert.equal(legacyBundle.includes("require('react-native-gesture-handler/ReanimatedSwipeable')"), false);
  assert.equal(legacyBundle.includes("require('react-native-reanimated')"), false);
  assert.equal(
    reanimatedAdapterBundle.includes("require(\"react-native-gesture-handler/ReanimatedSwipeable\")"),
    true
  );
});
