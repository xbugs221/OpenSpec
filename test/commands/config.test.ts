import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateConfig, validateConfigKeyPath } from '../../src/core/config-schema.js';
import { runCLI } from '../helpers/run-cli.js';
import { getGlobalConfigPath } from '../../src/core/global-config.js';

const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;
let tempDir = '';

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-config-command-'));
  process.env.XDG_CONFIG_HOME = tempDir;
});

afterEach(async () => {
  process.env.XDG_CONFIG_HOME = originalXdgConfigHome;
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

describe('config schema helpers', () => {
  it('allows featureFlags and rejects removed legacy install keys', () => {
    expect(validateConfigKeyPath('featureFlags').valid).toBe(true);
    expect(validateConfigKeyPath('featureFlags.alpha').valid).toBe(true);
    expect(validateConfigKeyPath('profile').valid).toBe(false);
    expect(validateConfigKeyPath('delivery').valid).toBe(false);
  });

  it('accepts featureFlags config and unknown passthrough keys', () => {
    expect(validateConfig({ featureFlags: { alpha: true } }).success).toBe(true);
    expect(validateConfig({ featureFlags: {}, custom: 'ok' }).success).toBe(true);
  });
});

describe('config command', () => {
  it('lists sanitized config values', async () => {
    await fs.mkdir(path.dirname(getGlobalConfigPath()), { recursive: true });
    await fs.writeFile(
      getGlobalConfigPath(),
      JSON.stringify({ featureFlags: { alpha: true }, profile: 'custom', custom: 'ok' }),
      'utf-8'
    );

    const result = await runCLI(['config', 'list', '--json'], {
      env: { XDG_CONFIG_HOME: tempDir },
    });

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      featureFlags: { alpha: true },
      custom: 'ok',
    });
  });

  it('rejects removed config profile command', async () => {
    const result = await runCLI(['config', 'profile'], {
      env: { XDG_CONFIG_HOME: tempDir },
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('has been removed');
  });

  it('sets and gets feature flags', async () => {
    const setResult = await runCLI(['config', 'set', 'featureFlags.alpha', 'true'], {
      env: { XDG_CONFIG_HOME: tempDir },
    });
    expect(setResult.exitCode).toBe(0);

    const getResult = await runCLI(['config', 'get', 'featureFlags.alpha'], {
      env: { XDG_CONFIG_HOME: tempDir },
    });
    expect(getResult.exitCode).toBe(0);
    expect(getResult.stdout.trim()).toBe('true');
  });

  it('rejects removed legacy keys during set', async () => {
    const result = await runCLI(['config', 'set', 'profile', 'custom'], {
      env: { XDG_CONFIG_HOME: tempDir },
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('removed legacy installation key');
  });
});
