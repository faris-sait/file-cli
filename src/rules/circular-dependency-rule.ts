import type { Rule, RuleContext } from './types.js';
import type { Suggestion } from '../types.js';

/**
 * Detects circular dependencies in the codebase
 */
export const circularDependencyRule: Rule = {
  id: 'circular-dependency',
  name: 'Circular Dependency',
  description: 'Detects circular import chains that can cause runtime issues',

  async run(context: RuleContext): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    const { circular } = context.dependencyGraph;

    for (const cycle of circular) {
      const cycleDescription = cycle.join(' -> ') + ' -> ' + cycle[0];

      suggestions.push({
        id: `circular-${cycle.join('-')}`,
        ruleId: this.id,
        severity: 'error',
        filePath: cycle[0] ?? 'unknown',
        message: `Circular dependency detected: ${cycle.length} files involved`,
        explanation: buildExplanation(cycle),
        suggestedAction: {
          type: 'split',
          description: `Break the cycle by extracting shared code. Cycle: ${cycleDescription}`,
        },
      });
    }

    return suggestions;
  },
};

function buildExplanation(cycle: string[]): string {
  return `
Circular dependencies occur when module A imports module B, which imports module A (directly or indirectly).

This cycle involves ${cycle.length} files:
${cycle.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}

Why this is a problem:
- Can cause undefined values at runtime due to incomplete module initialization
- Makes code harder to understand and maintain
- Can lead to subtle bugs that are difficult to debug

How to fix:
1. Extract shared functionality into a separate module that both files can import
2. Use dependency injection instead of direct imports
3. Restructure the code to have a clear dependency hierarchy
`.trim();
}
