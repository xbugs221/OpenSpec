import { afterEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { UpdateCommand } from '../../src/core/update.js';

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
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-update-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('UpdateCommand', () => {
  it('requires an existing openspec directory', async () => {
    const projectDir = await makeTempProject();
    const command = new UpdateCommand();

    await expect(command.execute(projectDir)).rejects.toThrow(/Run 'openspec init' first/);
  });

  it('refreshes only OpenSpec-owned paths', async () => {
    const projectDir = await makeTempProject();
    await fs.mkdir(path.join(projectDir, 'openspec', 'changes', 'archive'), { recursive: true });
    await fs.mkdir(path.join(projectDir, '.codex', 'skills'), { recursive: true });
    await fs.writeFile(path.join(projectDir, '.codex', 'skills', 'manual.md'), 'keep me');

    const command = new UpdateCommand();
    await command.execute(projectDir);

    expect(await exists(path.join(projectDir, 'openspec', 'specs'))).toBe(true);
    expect(await exists(path.join(projectDir, 'openspec', 'config.yaml'))).toBe(true);
    expect(await exists(path.join(projectDir, '.codex', 'skills', 'manual.md'))).toBe(true);
    expect(await exists(path.join(projectDir, '.claude', 'skills'))).toBe(false);
  });

  it('can refresh OpenSpec config with force without touching external files', async () => {
    const projectDir = await makeTempProject();
    await fs.mkdir(path.join(projectDir, 'openspec', 'changes', 'archive'), { recursive: true });
    await fs.writeFile(path.join(projectDir, 'openspec', 'config.yaml'), 'schema: old\n');
    await fs.mkdir(path.join(projectDir, '.claude', 'prompts'), { recursive: true });
    await fs.writeFile(path.join(projectDir, '.claude', 'prompts', 'manual.md'), 'manual');

    const command = new UpdateCommand({ force: true });
    await command.execute(projectDir);

    const configContent = await fs.readFile(path.join(projectDir, 'openspec', 'config.yaml'), 'utf-8');
    expect(configContent).toContain('schema: spec-driven');
    expect(await exists(path.join(projectDir, '.claude', 'prompts', 'manual.md'))).toBe(true);
  });
});
