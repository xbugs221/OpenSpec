/**
 * Purpose: resolve the repository-local OpenSpec state root and derive all
 * runtime paths from that canonical location.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const DEFAULT_STATE_ROOT = 'openspec';
export const STATE_ROOT_LOCATOR = '.openspec-root.json';

/**
 * Error thrown when the repository state-root locator is invalid.
 */
export class StateRootError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateRootError';
  }
}

/**
 * Validate and normalize a locator-provided state root.
 */
function normalizeStateRoot(projectRoot: string, stateRoot: string): string {
  /**
   * Convert user input into a trimmed POSIX-like relative path so persisted and
   * reported values stay stable across platforms.
   */
  const trimmed = stateRoot.trim();

  if (!trimmed) {
    throw new StateRootError(
      `Invalid ${STATE_ROOT_LOCATOR}: "stateRoot" must be a non-empty relative path.`
    );
  }

  if (path.isAbsolute(trimmed)) {
    throw new StateRootError(
      `Invalid ${STATE_ROOT_LOCATOR}: absolute paths are not allowed for "stateRoot".`
    );
  }

  const resolved = path.resolve(projectRoot, trimmed);
  const relativeToProject = path.relative(projectRoot, resolved);

  if (
    relativeToProject === '' ||
    relativeToProject === '.' ||
    relativeToProject.startsWith('..') ||
    path.isAbsolute(relativeToProject)
  ) {
    throw new StateRootError(
      `Invalid ${STATE_ROOT_LOCATOR}: "stateRoot" must stay within the project root.`
    );
  }

  return relativeToProject.replace(/\\/g, '/');
}

/**
 * Read the optional repository locator and return the configured relative state
 * root, defaulting to `openspec`.
 */
export function resolveStateRoot(projectRoot: string): string {
  /**
   * Runtime commands read the locator on demand so repository edits take effect
   * immediately without any cache invalidation logic.
   */
  const locatorPath = path.join(projectRoot, STATE_ROOT_LOCATOR);

  if (!existsSync(locatorPath)) {
    return DEFAULT_STATE_ROOT;
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(locatorPath, 'utf-8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new StateRootError(
      `Invalid ${STATE_ROOT_LOCATOR}: failed to parse JSON (${message}).`
    );
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new StateRootError(
      `Invalid ${STATE_ROOT_LOCATOR}: expected an object with a "stateRoot" field.`
    );
  }

  const { stateRoot } = raw as { stateRoot?: unknown };
  if (typeof stateRoot !== 'string') {
    throw new StateRootError(
      `Invalid ${STATE_ROOT_LOCATOR}: "stateRoot" must be a string.`
    );
  }

  return normalizeStateRoot(projectRoot, stateRoot);
}

/**
 * Return the absolute path to the resolved state-root directory.
 */
export function getStateRootDir(projectRoot: string): string {
  /** Join the validated relative locator with the project root. */
  return path.join(projectRoot, ...resolveStateRoot(projectRoot).split('/'));
}

/**
 * Return the absolute path to the changes directory.
 */
export function getChangesDir(projectRoot: string): string {
  /** All change discovery flows share this helper to avoid hardcoded layouts. */
  return path.join(getStateRootDir(projectRoot), 'changes');
}

/**
 * Return the absolute path to a single change directory.
 */
export function getChangeDir(projectRoot: string, changeName: string): string {
  /** Change-level commands use this helper so nested state roots remain transparent. */
  return path.join(getChangesDir(projectRoot), changeName);
}

/**
 * Return the absolute path to the archive directory under changes.
 */
export function getArchiveDir(projectRoot: string): string {
  /** Archive remains a directory contract within the resolved state tree. */
  return path.join(getChangesDir(projectRoot), 'archive');
}

/**
 * Return the absolute path to the main specs directory.
 */
export function getSpecsDir(projectRoot: string): string {
  /** Capability specs always live under the resolved state root. */
  return path.join(getStateRootDir(projectRoot), 'specs');
}

/**
 * Return the absolute path to the project-local schemas directory.
 */
export function getProjectSchemasDir(projectRoot: string): string {
  /** Project-local schema lookup must follow the same state-root contract. */
  return path.join(getStateRootDir(projectRoot), 'schemas');
}

/**
 * Return the preferred absolute path for the project config file.
 */
export function getProjectConfigPath(projectRoot: string): string {
  /** `.yaml` remains the canonical project config filename. */
  return path.join(getStateRootDir(projectRoot), 'config.yaml');
}

/**
 * Return both supported config file paths in priority order.
 */
export function getProjectConfigCandidates(projectRoot: string): string[] {
  /** `.yaml` wins over `.yml` to preserve the existing precedence contract. */
  const stateRootDir = getStateRootDir(projectRoot);
  return [
    path.join(stateRootDir, 'config.yaml'),
    path.join(stateRootDir, 'config.yml'),
  ];
}
