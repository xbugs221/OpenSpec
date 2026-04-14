import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  getGlobalConfigDir,
  getGlobalConfigPath,
  getGlobalConfig,
  saveGlobalConfig,
} from '../../src/core/global-config.js';

const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;
let tempDir = '';

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-global-config-'));
  process.env.XDG_CONFIG_HOME = tempDir;
});

afterEach(async () => {
  process.env.XDG_CONFIG_HOME = originalXdgConfigHome;
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

describe('global-config', () => {
  it('returns featureFlags defaults when config is missing', () => {
    expect(getGlobalConfigDir()).toBe(path.join(tempDir, 'openspec'));
    expect(getGlobalConfigPath()).toBe(path.join(tempDir, 'openspec', 'config.json'));
    expect(getGlobalConfig()).toEqual({ featureFlags: {} });
  });

  it('strips legacy install keys when loading config', async () => {
    await fs.mkdir(getGlobalConfigDir(), { recursive: true });
    await fs.writeFile(
      getGlobalConfigPath(),
      JSON.stringify({
        featureFlags: { alpha: true },
        profile: 'custom',
        delivery: 'commands',
        workflows: ['apply'],
        installScope: 'global',
        custom: 'kept',
      }),
      'utf-8'
    );

    expect(getGlobalConfig()).toEqual({
      featureFlags: { alpha: true },
      custom: 'kept',
    });
  });

  it('persists sanitized config content', async () => {
    saveGlobalConfig({
      featureFlags: { alpha: true },
      profile: 'custom',
      delivery: 'skills',
      custom: 'kept',
    });

    const raw = JSON.parse(await fs.readFile(getGlobalConfigPath(), 'utf-8'));
    expect(raw).toEqual({
      featureFlags: { alpha: true },
      custom: 'kept',
    });
  });
});
