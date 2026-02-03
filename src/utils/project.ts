import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import type { ProjectContext, Result } from '../types.js';
import { ok, err } from '../types.js';
import { GitService } from '../git/git-service.js';

const SUPPORTED_EXTENSIONS = new Set(['.ts', '.js', '.tsx', '.jsx']);
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage']);

/**
 * Create a project context by scanning the directory
 */
export async function createProjectContext(
  rootPath: string
): Promise<Result<ProjectContext>> {
  try {
    const files = await scanDirectory(rootPath);
    const git = new GitService(rootPath);
    const gitInitialized = await git.isGitRepo();

    return ok({
      rootPath,
      files,
      gitInitialized,
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Recursively scan directory for source files
 */
async function scanDirectory(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        const subFiles = await scanDirectory(fullPath);
        files.push(...subFiles);
      }
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Check if a path exists and is a directory
 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
