import type { ProjectContext, Suggestion } from '../types.js';
import type { DependencyGraph } from '../analyzers/dependency-analyzer.js';

/**
 * Context passed to each rule for analysis
 */
export interface RuleContext {
  project: ProjectContext;
  dependencyGraph: DependencyGraph;
}

/**
 * Base interface for all rules
 */
export interface Rule {
  /** Unique identifier for the rule */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description of what this rule detects */
  description: string;

  /** Run the rule and return suggestions */
  run(context: RuleContext): Promise<Suggestion[]>;
}

/**
 * Metadata for rule registration
 */
export interface RuleMetadata {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: 'error' | 'warning' | 'info';
}

export type RuleCategory =
  | 'structure'      // File/folder organization
  | 'dependencies'   // Import/export issues
  | 'naming'         // Naming conventions
  | 'dead-code';     // Unused files/exports
