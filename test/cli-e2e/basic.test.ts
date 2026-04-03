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

  describe('runtime-only compatibility', () => {
    it('fails stale init entry points with a runtime-only error', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'claude'], { cwd: emptyProjectDir });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('runtime-only OpenSpec CLI');
      expect(result.stderr).toContain('"init" command is not available');
    });

    it('fails stale update entry points with a runtime-only error', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const result = await runCLI(['update'], { cwd: projectDir });

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('runtime-only OpenSpec CLI');
      expect(result.stderr).toContain('"update" command is not available');
    });

    it('runtime commands do not create managed skills or prompt files', async () => {
      const projectDir = await prepareFixture('tmp-init');

      await runCLI(['list', '--json'], { cwd: projectDir, timeoutMs: 15000 });
      await runCLI(['status', '--change', 'c1', '--json'], { cwd: projectDir, timeoutMs: 15000 });
      await runCLI(['instructions', 'apply', '--change', 'c1', '--json'], {
        cwd: projectDir,
        timeoutMs: 15000,
      });
      await runCLI(['new', 'change', 'runtime-only-check'], { cwd: projectDir, timeoutMs: 15000 });

      expect(await fileExists(path.join(projectDir, '.codex', 'skills'))).toBe(false);
      expect(await fileExists(path.join(projectDir, '.claude', 'skills'))).toBe(false);
      expect(await fileExists(path.join(projectDir, '.claude', 'commands', 'openspec'))).toBe(false);
      expect(await fileExists(path.join(projectDir, 'openspec', 'AGENTS.md'))).toBe(false);
    });
  });
});
