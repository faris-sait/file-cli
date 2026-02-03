import chalk from 'chalk';
import type { Suggestion, SeverityLevel } from '../types.js';

const SEVERITY_COLORS: Record<SeverityLevel, (text: string) => string> = {
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
};

const SEVERITY_ICONS: Record<SeverityLevel, string> = {
  error: 'x',
  warning: '!',
  info: 'i',
};

/**
 * Format and print suggestions to the console
 */
export function formatSuggestions(
  suggestions: Suggestion[],
  verbose = false
): void {
  if (suggestions.length === 0) {
    return;
  }

  console.log(chalk.bold('\nSuggestions:\n'));

  // Group by severity
  const grouped = groupBySeverity(suggestions);

  for (const severity of ['error', 'warning', 'info'] as SeverityLevel[]) {
    const items = grouped.get(severity) ?? [];
    if (items.length === 0) continue;

    for (const suggestion of items) {
      printSuggestion(suggestion, verbose);
    }
  }
}

function groupBySeverity(suggestions: Suggestion[]): Map<SeverityLevel, Suggestion[]> {
  const grouped = new Map<SeverityLevel, Suggestion[]>();

  for (const suggestion of suggestions) {
    const existing = grouped.get(suggestion.severity) ?? [];
    existing.push(suggestion);
    grouped.set(suggestion.severity, existing);
  }

  return grouped;
}

function printSuggestion(suggestion: Suggestion, verbose: boolean): void {
  const colorFn = SEVERITY_COLORS[suggestion.severity];
  const icon = SEVERITY_ICONS[suggestion.severity];

  console.log(colorFn(`  ${icon} ${suggestion.message}`));
  console.log(chalk.dim(`    File: ${suggestion.filePath}`));
  console.log(chalk.dim(`    Rule: ${suggestion.ruleId}`));

  if (suggestion.suggestedAction) {
    console.log(chalk.cyan(`    Action: ${suggestion.suggestedAction.description}`));
  }

  if (verbose && suggestion.explanation) {
    console.log(chalk.dim('\n    Explanation:'));
    const lines = suggestion.explanation.split('\n');
    for (const line of lines) {
      console.log(chalk.dim(`      ${line}`));
    }
  }

  console.log('');
}
