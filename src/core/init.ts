/**
 * Purpose: initialize only OpenSpec-owned project state without creating any
 * external agent skills, prompts, or command files.
 */

import path from 'path';
import { FileSystemUtils } from '../utils/file-system.js';
import { serializeConfig } from './config-prompts.js';
import { OPENSPEC_DIR_NAME } from './config.js';

const DEFAULT_SCHEMA = 'spec-driven';

export interface InitCommandOptions {
  tools?: string;
  force?: boolean;
  interactive?: boolean;
  profile?: string;
}

function assertNoLegacyArtifactOptions(options: InitCommandOptions): void {
  if (options.tools !== undefined) {
    throw new Error('The --tools option is no longer supported. OpenSpec no longer installs agent skills or prompts.');
  }

  if (options.profile !== undefined) {
    throw new Error('The --profile option is no longer supported. Workflow distribution is no longer managed by OpenSpec.');
  }
}

export class InitCommand {
  private readonly force: boolean;

  constructor(private readonly options: InitCommandOptions = {}) {
    this.force = options.force ?? false;
  }

  async execute(targetPath: string): Promise<void> {
    assertNoLegacyArtifactOptions(this.options);

    const projectPath = path.resolve(targetPath);
    const openspecPath = path.join(projectPath, OPENSPEC_DIR_NAME);
    const configPath = path.join(openspecPath, 'config.yaml');

    if (!(await FileSystemUtils.ensureWritePermissions(projectPath))) {
      throw new Error(`Insufficient permissions to write to ${projectPath}`);
    }

    for (const dir of [
      openspecPath,
      path.join(openspecPath, 'specs'),
      path.join(openspecPath, 'changes'),
      path.join(openspecPath, 'changes', 'archive'),
    ]) {
      await FileSystemUtils.createDirectory(dir);
    }

    let configStatus: 'created' | 'refreshed' | 'exists' = 'exists';

    if (!(await FileSystemUtils.fileExists(configPath))) {
      await FileSystemUtils.writeFile(configPath, serializeConfig({ schema: DEFAULT_SCHEMA }));
      configStatus = 'created';
    } else if (this.force) {
      await FileSystemUtils.writeFile(configPath, serializeConfig({ schema: DEFAULT_SCHEMA }));
      configStatus = 'refreshed';
    }

    console.log();
    console.log('OpenSpec initialized');
    console.log(`Project: ${projectPath}`);
    console.log(`State: ${OPENSPEC_DIR_NAME}/`);
    console.log(`Config: ${OPENSPEC_DIR_NAME}/config.yaml (${configStatus})`);
    console.log();
    console.log('OpenSpec manages only its own project state.');
  }
}
