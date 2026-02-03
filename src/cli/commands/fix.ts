import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { resolve } from 'path';
import type { ProjectContext, Suggestion } from '../../types.js';
import { createProjectContext } from '../../utils/project.js';
import { runAllRules } from '../../rules/index.js';
import { applyFix } from '../../actions/index.js';
import { GitService } from '../../git/git-service.js';

interface FixOptions {
    interactive: boolean;
    all?: boolean;
}

export async function fixCommand(
    path: string,
    options: FixOptions
): Promise<void> {
    const rootPath = resolve(path);
    const spinner = ora('Analyzing project structure...').start();

    try {
        // Check Git status first
        const git = new GitService(rootPath);
        const statusResult = await git.getStatus();

        if (statusResult.ok && statusResult.value.hasUncommittedChanges) {
            spinner.warn(chalk.yellow('Warning: Uncommitted changes detected'));

            const { proceed } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'proceed',
                    message: 'Do you want to proceed anyway?',
                    default: false,
                },
            ]);

            if (!proceed) {
                console.log(chalk.yellow('\nPlease commit your changes before running fixes.'));
                process.exit(0);
            }
        }

        // Create project context
        const contextResult = await createProjectContext(rootPath);
        if (!contextResult.ok) {
            spinner.fail(chalk.red(`Failed to analyze: ${contextResult.error.message}`));
            process.exit(1);
        }

        const context: ProjectContext = contextResult.value;

        // Run analysis rules
        const suggestions: Suggestion[] = await runAllRules(context);
        spinner.succeed('Analysis complete');

        if (suggestions.length === 0) {
            console.log(chalk.green('\n✨ No issues found! Your project structure looks good.'));
            return;
        }

        // Filter fixable suggestions
        const fixable = suggestions.filter(s =>
            s.suggestedAction.type === 'delete' ||
            s.suggestedAction.type === 'rename' ||
            s.suggestedAction.type === 'move'
        );

        if (fixable.length === 0) {
            console.log(chalk.yellow('\n⚠️  Found issues but none can be auto-fixed.'));
            console.log(chalk.dim('Run `structlint analyze --verbose` for details.\n'));
            return;
        }

        console.log(chalk.bold(`\nFound ${fixable.length} fixable issue(s):\n`));

        if (options.all) {
            await applyAllFixes(fixable);
        } else {
            await interactiveFix(fixable);
        }

    } catch (error) {
        spinner.fail(chalk.red('Fix operation failed'));
        console.error(error);
        process.exit(1);
    }
}

async function interactiveFix(suggestions: Suggestion[]): Promise<void> {
    for (let i = 0; i < suggestions.length; i++) {
        const suggestion = suggestions[i];
        if (!suggestion) continue;

        console.log(chalk.bold(`\n[${i + 1}/${suggestions.length}]`));
        console.log(chalk.yellow(`${suggestion.severity.toUpperCase()}: ${suggestion.message}`));
        console.log(chalk.dim(`File: ${suggestion.filePath}`));
        console.log(chalk.cyan(`Action: ${suggestion.suggestedAction.description}`));

        if (suggestion.explanation) {
            console.log(chalk.dim('\nExplanation:'));
            const lines = suggestion.explanation.split('\n').slice(0, 5);
            lines.forEach(line => console.log(chalk.dim(`  ${line}`)));
            if (suggestion.explanation.split('\n').length > 5) {
                console.log(chalk.dim('  ...'));
            }
        }

        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    { name: 'Apply fix', value: 'fix' },
                    { name: 'Skip', value: 'skip' },
                    { name: 'Skip all remaining', value: 'skip-all' },
                    { name: 'Abort', value: 'abort' },
                ],
            },
        ]);

        if (action === 'abort') {
            console.log(chalk.yellow('\n⚠️  Operation aborted.'));
            process.exit(0);
        }

        if (action === 'skip-all') {
            console.log(chalk.yellow('\n⚠️  Skipping all remaining issues.'));
            break;
        }

        if (action === 'fix') {
            const spinner = ora('Applying fix...').start();
            const result = await applyFix(suggestion);

            if (result.ok) {
                spinner.succeed(chalk.green(result.value));
            } else {
                spinner.fail(chalk.red(`Failed: ${result.error.message}`));
            }
        } else {
            console.log(chalk.dim('Skipped.'));
        }
    }

    console.log(chalk.green('\n✨ Fix operation complete!\n'));
}

async function applyAllFixes(suggestions: Suggestion[]): Promise<void> {
    console.log(chalk.bold('\nApplying all fixes...\n'));

    let fixed = 0;
    let failed = 0;

    for (const suggestion of suggestions) {
        const spinner = ora(suggestion.suggestedAction.description).start();
        const result = await applyFix(suggestion);

        if (result.ok) {
            spinner.succeed(chalk.green(result.value));
            fixed++;
        } else {
            spinner.fail(chalk.red(`Failed: ${result.error.message}`));
            failed++;
        }
    }

    console.log(chalk.bold(`\n✨ Applied ${fixed} fix(es), ${failed} failed.\n`));
}
