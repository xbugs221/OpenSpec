import { afterAll, describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { runCLI, cliProjectRoot } from '../helpers/run-cli.js';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const tempRoots: string[] = [];

async function prepareFixture(fixtureName: string): Promise<string> {
  const base = await fs.mkdtemp(path.join(tmpdir(), 'openspec-cli-e2e-'));
  tempRoots.push(base);
  const projectDir = path.join(base, 'project');
  await fs.mkdir(projectDir, { recursive: true });
  const fixtureDir = path.join(cliProjectRoot, 'test', 'fixtures', fixtureName);
  await fs.cp(fixtureDir, projectDir, { recursive: true });
  return projectDir;
}

afterAll(async () => {
  await Promise.all(tempRoots.map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('openspec CLI e2e basics', () => {
  it('shows help output', async () => {
    const result = await runCLI(['--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage: openspec');
    expect(result.stderr).toBe('');

  });

  it('reports the package version', async () => {
    const pkgRaw = await fs.readFile(path.join(cliProjectRoot, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    const result = await runCLI(['--version']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe(pkg.version);
  });

  it('validates the tmp-init fixture with --all --json', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['validate', '--all', '--json'], { cwd: projectDir });
    expect(result.exitCode).toBe(0);
    const output = result.stdout.trim();
    expect(output).not.toBe('');
    const json = JSON.parse(output);
    expect(json.summary?.totals?.failed).toBe(0);
    expect(json.items.some((item: any) => item.id === 'c1' && item.type === 'change')).toBe(true);
  });

  it('returns an error for unknown items in the fixture', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['validate', 'does-not-exist'], { cwd: projectDir });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Unknown item 'does-not-exist'");
  });

  describe('CLI-only init and update', () => {
    it('rejects removed legacy init distribution flags', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'claude'], { cwd: emptyProjectDir });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('--tools option is no longer supported');
    });

    it('initializes only OpenSpec-owned files', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'cli-only-project');
      await fs.mkdir(path.join(emptyProjectDir, '.claude'), { recursive: true });

      const result = await runCLI(['init'], { cwd: emptyProjectDir });

      expect(result.exitCode).toBe(0);
      expect(await fileExists(path.join(emptyProjectDir, 'openspec', 'config.yaml'))).toBe(true);
      expect(await fileExists(path.join(emptyProjectDir, '.claude'))).toBe(true);
      expect(await fileExists(path.join(emptyProjectDir, '.claude', 'skills'))).toBe(false);
      expect(await fileExists(path.join(emptyProjectDir, '.codex', 'prompts'))).toBe(false);
    });

    it('update does not mutate managed skills or prompt files', async () => {
      const projectDir = await prepareFixture('tmp-init');
      await fs.mkdir(path.join(projectDir, '.codex', 'prompts'), { recursive: true });
      await fs.writeFile(path.join(projectDir, '.codex', 'prompts', 'manual.md'), 'manual');

      const result = await runCLI(['update'], { cwd: projectDir });

      expect(result.exitCode).toBe(0);
      expect(await fileExists(path.join(projectDir, '.codex', 'prompts', 'manual.md'))).toBe(true);
      expect(await fileExists(path.join(projectDir, '.claude', 'skills'))).toBe(false);
      expect(await fileExists(path.join(projectDir, 'openspec', 'AGENTS.md'))).toBe(false);
    });
  });
});
