import { simpleGit, SimpleGit } from 'simple-git';
import type { Result } from '../types.js';
import { ok, err } from '../types.js';

export interface GitStatus {
  isGitRepo: boolean;
  hasUncommittedChanges: boolean;
  currentBranch: string | null;
  stagedFiles: string[];
  modifiedFiles: string[];
  untrackedFiles: string[];
}

export class GitService {
  private git: SimpleGit;

  constructor(rootPath: string) {
    this.git = simpleGit(rootPath);
  }

  /**
   * Check if the directory is a Git repository
   */
  async isGitRepo(): Promise<boolean> {
    try {
      await this.git.revparse(['--git-dir']);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get comprehensive Git status
   */
  async getStatus(): Promise<Result<GitStatus>> {
    try {
      const isRepo = await this.isGitRepo();

      if (!isRepo) {
        return ok({
          isGitRepo: false,
          hasUncommittedChanges: false,
          currentBranch: null,
          stagedFiles: [],
          modifiedFiles: [],
          untrackedFiles: [],
        });
      }

      const status = await this.git.status();

      return ok({
        isGitRepo: true,
        hasUncommittedChanges: !status.isClean(),
        currentBranch: status.current,
        stagedFiles: status.staged,
        modifiedFiles: status.modified,
        untrackedFiles: status.not_added,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Create a checkpoint commit before refactoring
   */
  async createCheckpoint(message: string): Promise<Result<string>> {
    try {
      const status = await this.git.status();

      if (!status.isClean()) {
        return err(new Error('Working directory has uncommitted changes'));
      }

      // Create an empty commit as a checkpoint
      await this.git.commit(message, { '--allow-empty': null });
      const log = await this.git.log({ maxCount: 1 });

      return ok(log.latest?.hash ?? 'unknown');
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Rollback to a specific commit
   */
  async rollbackTo(commitHash: string): Promise<Result<void>> {
    try {
      await this.git.reset(['--hard', commitHash]);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
