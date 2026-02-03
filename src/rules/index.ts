import type { ProjectContext, Suggestion } from '../types.js';
import type { Rule, RuleContext } from './types.js';
import { DependencyAnalyzer } from '../analyzers/dependency-analyzer.js';
import { circularDependencyRule } from './circular-dependency-rule.js';
import { orphanFilesRule } from './orphan-files-rule.js';

/**
 * Registry of all available rules
 */
const rules: Rule[] = [
  circularDependencyRule,
  orphanFilesRule,
  // Add more rules here as they are implemented
];

/**
 * Run all registered rules against the project
 */
export async function runAllRules(project: ProjectContext): Promise<Suggestion[]> {
  const analyzer = new DependencyAnalyzer(project.rootPath);
  const graphResult = await analyzer.analyze();

  if (!graphResult.ok) {
    throw graphResult.error;
  }

  const context: RuleContext = {
    project,
    dependencyGraph: graphResult.value,
  };

  const allSuggestions: Suggestion[] = [];

  for (const rule of rules) {
    const suggestions = await rule.run(context);
    allSuggestions.push(...suggestions);
  }

  return allSuggestions;
}

/**
 * Get metadata for all registered rules
 */
export function getRegisteredRules(): Rule[] {
  return [...rules];
}

export type { Rule, RuleContext, RuleMetadata, RuleCategory } from './types.js';
