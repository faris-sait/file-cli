import chalk from 'chalk';
import { resolve } from 'path';
import { GitService } from '../../git/git-service.js';

export async function checkGitCommand(path: string): Promise<void> {
  const rootPath = resolve(path);
  const git = new GitService(rootPath);

  const statusResult = await git.getStatus();

  if (!statusResult.ok) {
    console.log(chalk.red(`Git error: ${statusResult.error.message}`));
    process.exit(1);
  }

  const status = statusResult.value;

  console.log(chalk.bold('\nGit Status Check\n'));

  if (!status.isGitRepo) {
    console.log(chalk.yellow('  Not a Git repository'));
    console.log(chalk.dim('  Initialize with: git init\n'));
    return;
  }

  console.log(chalk.green('  Git repository detected'));

  if (status.hasUncommittedChanges) {
    console.log(chalk.yellow('  Uncommitted changes detected'));
    console.log(chalk.dim('  Commit or stash changes before refactoring\n'));
  } else {
    console.log(chalk.green('  Working directory clean'));
    console.log(chalk.dim('  Safe to proceed with refactoring\n'));
  }
}
