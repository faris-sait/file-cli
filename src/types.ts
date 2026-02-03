/**
 * Core types used throughout the application
 */

export interface ProjectContext {
  rootPath: string;
  files: string[];
  gitInitialized: boolean;
}

export interface AnalysisResult {
  filePath: string;
  imports: ImportInfo[];
  exports: ExportInfo[];
  dependencies: string[];
}

export interface ImportInfo {
  source: string;
  specifiers: string[];
  isDefault: boolean;
  line: number;
}

export interface ExportInfo {
  name: string;
  isDefault: boolean;
  line: number;
}

export interface Suggestion {
  id: string;
  ruleId: string;
  severity: SeverityLevel;
  filePath: string;
  message: string;
  explanation: string;
  suggestedAction: SuggestedAction;
}

export type SeverityLevel = 'error' | 'warning' | 'info';

export interface SuggestedAction {
  type: 'move' | 'rename' | 'merge' | 'split' | 'delete';
  description: string;
  from?: string;
  to?: string;
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
