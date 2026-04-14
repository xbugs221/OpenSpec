import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export const GLOBAL_CONFIG_DIR_NAME = 'openspec';
export const GLOBAL_CONFIG_FILE_NAME = 'config.json';
export const GLOBAL_DATA_DIR_NAME = 'openspec';

const LEGACY_INSTALL_KEYS = new Set(['profile', 'delivery', 'workflows', 'aiTools', 'installScope']);

export interface GlobalConfig {
  featureFlags?: Record<string, boolean>;
  [key: string]: unknown;
}

const DEFAULT_CONFIG: GlobalConfig = {
  featureFlags: {},
};

export function getGlobalConfigDir(): string {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return path.join(xdgConfigHome, GLOBAL_CONFIG_DIR_NAME);
  }

  const platform = os.platform();
  if (platform === 'win32') {
    const appData = process.env.APPDATA;
    if (appData) {
      return path.join(appData, GLOBAL_CONFIG_DIR_NAME);
    }
    return path.join(os.homedir(), 'AppData', 'Roaming', GLOBAL_CONFIG_DIR_NAME);
  }

  return path.join(os.homedir(), '.config', GLOBAL_CONFIG_DIR_NAME);
}

export function getGlobalDataDir(): string {
  const xdgDataHome = process.env.XDG_DATA_HOME;
  if (xdgDataHome) {
    return path.join(xdgDataHome, GLOBAL_DATA_DIR_NAME);
  }

  const platform = os.platform();
  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      return path.join(localAppData, GLOBAL_DATA_DIR_NAME);
    }
    return path.join(os.homedir(), 'AppData', 'Local', GLOBAL_DATA_DIR_NAME);
  }

  return path.join(os.homedir(), '.local', 'share', GLOBAL_DATA_DIR_NAME);
}

export function getGlobalConfigPath(): string {
  return path.join(getGlobalConfigDir(), GLOBAL_CONFIG_FILE_NAME);
}

function sanitizeLoadedConfig(parsed: unknown): GlobalConfig {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ...DEFAULT_CONFIG };
  }

  const sanitized: GlobalConfig = {};

  for (const [key, value] of Object.entries(parsed)) {
    if (LEGACY_INSTALL_KEYS.has(key)) {
      continue;
    }

    if (key === 'featureFlags') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized.featureFlags = Object.fromEntries(
          Object.entries(value).filter(([, flagValue]) => typeof flagValue === 'boolean')
        ) as Record<string, boolean>;
      }
      continue;
    }

    sanitized[key] = value;
  }

  sanitized.featureFlags = {
    ...DEFAULT_CONFIG.featureFlags,
    ...(sanitized.featureFlags ?? {}),
  };

  return sanitized;
}

export function getGlobalConfig(): GlobalConfig {
  const configPath = getGlobalConfigPath();

  try {
    if (!fs.existsSync(configPath)) {
      return { ...DEFAULT_CONFIG };
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    return sanitizeLoadedConfig(JSON.parse(content));
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`Warning: Invalid JSON in ${configPath}, using defaults`);
    }
    return { ...DEFAULT_CONFIG };
  }
}

export function saveGlobalConfig(config: GlobalConfig): void {
  const configDir = getGlobalConfigDir();
  const configPath = getGlobalConfigPath();

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(sanitizeLoadedConfig(config), null, 2) + '\n', 'utf-8');
}
