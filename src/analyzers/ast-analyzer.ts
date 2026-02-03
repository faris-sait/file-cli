import { Project, SourceFile } from 'ts-morph';
import type { AnalysisResult, ImportInfo, ExportInfo, Result } from '../types.js';
import { ok, err } from '../types.js';

export class AstAnalyzer {
  private project: Project;

  constructor(tsConfigPath?: string) {
    this.project = new Project({
      tsConfigFilePath: tsConfigPath,
      skipAddingFilesFromTsConfig: true,
    });
  }

  /**
   * Analyze a single file for imports and exports
   */
  analyzeFile(filePath: string): Result<AnalysisResult> {
    try {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      const imports = this.extractImports(sourceFile);
      const exports = this.extractExports(sourceFile);

      return ok({
        filePath,
        imports,
        exports,
        dependencies: imports.map(i => i.source),
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private extractImports(sourceFile: SourceFile): ImportInfo[] {
    const imports: ImportInfo[] = [];

    for (const importDecl of sourceFile.getImportDeclarations()) {
      const specifiers: string[] = [];
      let isDefault = false;

      const defaultImport = importDecl.getDefaultImport();
      if (defaultImport) {
        specifiers.push(defaultImport.getText());
        isDefault = true;
      }

      for (const named of importDecl.getNamedImports()) {
        specifiers.push(named.getName());
      }

      imports.push({
        source: importDecl.getModuleSpecifierValue(),
        specifiers,
        isDefault,
        line: importDecl.getStartLineNumber(),
      });
    }

    return imports;
  }

  private extractExports(sourceFile: SourceFile): ExportInfo[] {
    const exports: ExportInfo[] = [];

    // Named exports
    for (const exportDecl of sourceFile.getExportDeclarations()) {
      for (const named of exportDecl.getNamedExports()) {
        exports.push({
          name: named.getName(),
          isDefault: false,
          line: exportDecl.getStartLineNumber(),
        });
      }
    }

    // Default exports
    const defaultExport = sourceFile.getDefaultExportSymbol();
    if (defaultExport) {
      exports.push({
        name: 'default',
        isDefault: true,
        line: 1, // Approximate
      });
    }

    // Exported declarations
    for (const fn of sourceFile.getFunctions()) {
      if (fn.isExported()) {
        exports.push({
          name: fn.getName() ?? 'anonymous',
          isDefault: fn.isDefaultExport(),
          line: fn.getStartLineNumber(),
        });
      }
    }

    return exports;
  }
}
