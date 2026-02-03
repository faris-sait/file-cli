import chalk from 'chalk';
import ora from 'ora';
import { resolve } from 'path';
import type { ProjectContext, Suggestion } from '../../types.js';
import { createProjectContext } from '../../utils/project.js';
import { runAllRules } from '../../rules/index.js';
import { formatSuggestions } from '../../suggestions/formatter.js';

interface AnalyzeOptions {
  dryRun: boolean;
  output: 'text' | 'json';
  verbose?: boolean;
}

export async function analyzeCommand(
  path: string,
  options: AnalyzeOptions
): Promise<void> {
  const rootPath = resolve(path);
  const spinner = ora('Analyzing project structure...').start();

  try {
    // Create project context
    const contextResult = await createProjectContext(rootPath);
    if (!contextResult.ok) {
      spinner.fail(chalk.red(`Failed to analyze: ${contextResult.error.message}`));
      process.exit(1);
    }

    const context: ProjectContext = contextResult.value;
    spinner.text = `Found ${context.files.length} files to analyze`;

    // Run analysis rules
    const suggestions: Suggestion[] = await runAllRules(context);
    spinner.succeed('Analysis complete');

    // Output results
    if (options.output === 'json') {
      console.log(JSON.stringify(suggestions, null, 2));
    } else {
      formatSuggestions(suggestions, options.verbose);
    }

    // Summary
    const errorCount = suggestions.filter(s => s.severity === 'error').length;
    const warningCount = suggestions.filter(s => s.severity === 'warning').length;

    if (errorCount > 0 || warningCount > 0) {
      console.log(
        chalk.yellow(`\nFound ${errorCount} errors and ${warningCount} warnings`)
      );
    } else {
      console.log(chalk.green('\nNo issues found!'));
    }
  } catch (error) {
    spinner.fail(chalk.red('Analysis failed'));
    console.error(error);
    process.exit(1);
  }
}
