/**
 * Purpose: refresh only OpenSpec-owned project state without touching external
 * agent skills, prompts, or command files.
 */

import path from 'path';
import { FileSystemUtils } from '../utils/file-system.js';
import { serializeConfig } from './config-prompts.js';
import { OPENSPEC_DIR_NAME } from './config.js';

const DEFAULT_SCHEMA = 'spec-driven';

export interface UpdateCommandOptions {
  force?: boolean;
}

export class UpdateCommand {
  private readonly force: boolean;

  constructor(options: UpdateCommandOptions = {}) {
    this.force = options.force ?? false;
  }

  async execute(targetPath: string): Promise<void> {
    const projectPath = path.resolve(targetPath);
    const openspecPath = path.join(projectPath, OPENSPEC_DIR_NAME);
    const configPath = path.join(openspecPath, 'config.yaml');

    if (!await FileSystemUtils.directoryExists(openspecPath)) {
      throw new Error(`No OpenSpec directory found. Run 'openspec init' first.`);
    }

    for (const dir of [
      openspecPath,
      path.join(openspecPath, 'specs'),
      path.join(openspecPath, 'changes'),
      path.join(openspecPath, 'changes', 'archive'),
    ]) {
      await FileSystemUtils.createDirectory(dir);
    }

    let configStatus: 'created' | 'refreshed' | 'verified' = 'verified';

    if (!(await FileSystemUtils.fileExists(configPath))) {
      await FileSystemUtils.writeFile(configPath, serializeConfig({ schema: DEFAULT_SCHEMA }));
      configStatus = 'created';
    } else if (this.force) {
      await FileSystemUtils.writeFile(configPath, serializeConfig({ schema: DEFAULT_SCHEMA }));
      configStatus = 'refreshed';
    }

    console.log();
    console.log('OpenSpec project is up to date');
    console.log(`Project: ${projectPath}`);
    console.log(`Config: ${OPENSPEC_DIR_NAME}/config.yaml (${configStatus})`);
    console.log();
    console.log('External agent skills and prompts are not managed by OpenSpec.');
  }
}
