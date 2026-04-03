import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import {
  DEFAULT_STATE_ROOT,
  STATE_ROOT_LOCATOR,
  StateRootError,
  resolveStateRoot,
  getStateRootDir,
  getChangesDir,
  getArchiveDir,
  getSpecsDir,
  getProjectSchemasDir,
  getProjectConfigPath,
} from '../../src/core/state-root.js';

describe('state-root helpers', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-state-root-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('falls back to the default openspec state root when locator is absent', () => {
    expect(resolveStateRoot(tempDir)).toBe(DEFAULT_STATE_ROOT);
    expect(getStateRootDir(tempDir)).toBe(path.join(tempDir, 'openspec'));
    expect(getChangesDir(tempDir)).toBe(path.join(tempDir, 'openspec', 'changes'));
  });

  it('derives runtime paths from a nested locator root', async () => {
    await fs.writeFile(
      path.join(tempDir, STATE_ROOT_LOCATOR),
      JSON.stringify({ stateRoot: '.planning/openspec' }, null, 2)
    );

    expect(resolveStateRoot(tempDir)).toBe('.planning/openspec');
    expect(getStateRootDir(tempDir)).toBe(path.join(tempDir, '.planning', 'openspec'));
    expect(getChangesDir(tempDir)).toBe(path.join(tempDir, '.planning', 'openspec', 'changes'));
    expect(getArchiveDir(tempDir)).toBe(
      path.join(tempDir, '.planning', 'openspec', 'changes', 'archive')
    );
    expect(getSpecsDir(tempDir)).toBe(path.join(tempDir, '.planning', 'openspec', 'specs'));
    expect(getProjectSchemasDir(tempDir)).toBe(
      path.join(tempDir, '.planning', 'openspec', 'schemas')
    );
    expect(getProjectConfigPath(tempDir)).toBe(
      path.join(tempDir, '.planning', 'openspec', 'config.yaml')
    );
  });

  it('rejects absolute stateRoot values', async () => {
    await fs.writeFile(
      path.join(tempDir, STATE_ROOT_LOCATOR),
      JSON.stringify({ stateRoot: path.join(tempDir, 'external-root') }, null, 2)
    );

    expect(() => resolveStateRoot(tempDir)).toThrow(StateRootError);
    expect(() => resolveStateRoot(tempDir)).toThrow(/absolute paths are not allowed/i);
  });

  it('rejects project-escaping stateRoot values', async () => {
    await fs.writeFile(
      path.join(tempDir, STATE_ROOT_LOCATOR),
      JSON.stringify({ stateRoot: '../shared/openspec' }, null, 2)
    );

    expect(() => resolveStateRoot(tempDir)).toThrow(StateRootError);
    expect(() => resolveStateRoot(tempDir)).toThrow(/must stay within the project root/i);
  });
});
