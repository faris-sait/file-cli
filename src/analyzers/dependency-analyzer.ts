import madge from 'madge';
import type { Result } from '../types.js';
import { ok, err } from '../types.js';

export interface DependencyGraph {
  /** Map of file path to its dependencies */
  dependencies: Map<string, string[]>;
  /** Map of file path to files that depend on it */
  dependents: Map<string, string[]>;
  /** Files with circular dependencies */
  circular: string[][];
  /** Files with no dependents (potential dead code) */
  orphans: string[];
}

export class DependencyAnalyzer {
  constructor(private rootPath: string) {}

  /**
   * Build a dependency graph for the project
   */
  async analyze(): Promise<Result<DependencyGraph>> {
    try {
      const result = await madge(this.rootPath, {
        fileExtensions: ['ts', 'js', 'tsx', 'jsx'],
        excludeRegExp: [/node_modules/, /\.test\./, /\.spec\./],
      });

      const rawDeps = result.obj();
      const dependencies = new Map<string, string[]>();
      const dependents = new Map<string, string[]>();

      // Build dependencies map
      for (const [file, deps] of Object.entries(rawDeps)) {
        dependencies.set(file, deps);
      }

      // Build dependents map (reverse lookup)
      for (const [file, deps] of dependencies) {
        for (const dep of deps) {
          const existing = dependents.get(dep) ?? [];
          existing.push(file);
          dependents.set(dep, existing);
        }
      }

      // Find orphans (files with no dependents, excluding entry points)
      const orphans: string[] = [];
      for (const file of dependencies.keys()) {
        if (!dependents.has(file) && !this.isEntryPoint(file)) {
          orphans.push(file);
        }
      }

      // Get circular dependencies
      const circular = result.circular();

      return ok({
        dependencies,
        dependents,
        circular,
        orphans,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Check if a file is likely an entry point
   */
  private isEntryPoint(filePath: string): boolean {
    const entryPatterns = [
      /index\.[jt]sx?$/,
      /main\.[jt]sx?$/,
      /app\.[jt]sx?$/,
      /server\.[jt]sx?$/,
    ];
    return entryPatterns.some(pattern => pattern.test(filePath));
  }
}
