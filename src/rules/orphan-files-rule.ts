import type { Rule, RuleContext } from './types.js';
import type { Suggestion } from '../types.js';

/**
 * Detects files that are not imported anywhere (potential dead code)
 */
export const orphanFilesRule: Rule = {
  id: 'orphan-files',
  name: 'Orphan Files',
  description: 'Detects files with no incoming imports (potential dead code)',

  async run(context: RuleContext): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    const { orphans } = context.dependencyGraph;

    for (const orphan of orphans) {
      suggestions.push({
        id: `orphan-${orphan}`,
        ruleId: this.id,
        severity: 'warning',
        filePath: orphan,
        message: `File appears to be unused (no imports found)`,
        explanation: buildExplanation(orphan),
        suggestedAction: {
          type: 'delete',
          description: `Consider removing this file if it's truly unused`,
          from: orphan,
        },
      });
    }

    return suggestions;
  },
};

function buildExplanation(filePath: string): string {
  return `
The file "${filePath}" is not imported by any other file in the project.

This could mean:
1. The file is dead code and can be safely removed
2. The file is an entry point that should be excluded from this check
3. The file is imported dynamically (require() or import())
4. The file is used by external tools (tests, scripts, etc.)

Before deleting:
- Check if it's referenced in package.json scripts
- Check if it's used in configuration files
- Search for dynamic imports: require('${filePath}') or import('${filePath}')
- Verify it's not a CLI entry point or worker file
`.trim();
}
