import { afterEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { InitCommand } from '../../src/core/init.js';

async function exists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

const tempDirs: string[] = [];

async function makeTempProject(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-init-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('InitCommand', () => {
  it('creates only OpenSpec-owned project state', async () => {
    const projectDir = await makeTempProject();
    const command = new InitCommand();

    await command.execute(projectDir);

    expect(await exists(path.join(projectDir, 'openspec'))).toBe(true);
    expect(await exists(path.join(projectDir, 'openspec', 'specs'))).toBe(true);
    expect(await exists(path.join(projectDir, 'openspec', 'changes'))).toBe(true);
    expect(await exists(path.join(projectDir, 'openspec', 'changes', 'archive'))).toBe(true);
    expect(await exists(path.join(projectDir, 'openspec', 'config.yaml'))).toBe(true);
    expect(await exists(path.join(projectDir, '.claude'))).toBe(false);
    expect(await exists(path.join(projectDir, '.codex'))).toBe(false);
  });

  it('does not mutate pre-existing tool-owned directories', async () => {
    const projectDir = await makeTempProject();
    await fs.mkdir(path.join(projectDir, '.claude'), { recursive: true });
    const command = new InitCommand();

    await command.execute(projectDir);

    expect(await exists(path.join(projectDir, '.claude'))).toBe(true);
    expect(await exists(path.join(projectDir, '.claude', 'skills'))).toBe(false);
    expect(await exists(path.join(projectDir, '.claude', 'commands'))).toBe(false);
  });

  it('rejects legacy artifact distribution options', async () => {
    const projectDir = await makeTempProject();
    const command = new InitCommand({ tools: 'claude' });

    await expect(command.execute(projectDir)).rejects.toThrow(/--tools option is no longer supported/);
  });
});
