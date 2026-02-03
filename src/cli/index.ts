#!/usr/bin/env node

import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze.js';
import { checkGitCommand } from './commands/check-git.js';
import { fixCommand } from './commands/fix.js';

const program = new Command();

program
  .name('structlint')
  .description('Analyze and clean up messy project file structures')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze project structure and suggest improvements')
  .argument('[path]', 'Path to project root', '.')
  .option('-d, --dry-run', 'Show suggestions without applying changes', true)
  .option('-o, --output <format>', 'Output format (text|json)', 'text')
  .option('-v, --verbose', 'Show detailed analysis information')
  .action(analyzeCommand);

program
  .command('fix')
  .description('Interactively fix detected issues')
  .argument('[path]', 'Path to project root', '.')
  .option('--all', 'Apply all fixes without prompting')
  .action(fixCommand);

program
  .command('check-git')
  .description('Verify Git status before making changes')
  .argument('[path]', 'Path to project root', '.')
  .action(checkGitCommand);

program.parse();
