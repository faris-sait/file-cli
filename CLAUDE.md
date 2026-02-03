# CLAUDE.md

## Project Overview

A CLI tool that analyzes and cleans up messy project file structures in a safe, explainable, and opinionated way. The tool suggests changes with explanations rather than blindly auto-refactoring.

**Target:** Express.js / Node.js backend projects (MVP scope)

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **AST Analysis:** Babel, ts-morph
- **Dependency Graphs:** Madge
- **Version Control:** Git-aware with rollback support

## Core Design Principles

1. **Safety over automation** - Never auto-refactor; always suggest with explanations
2. **Explainability** - Every suggestion must explain WHY, not just WHERE
3. **Developer trust** - Prioritize correctness and transparency
4. **Simplicity > cleverness** - Maintainable open-source quality code
5. **Incremental growth** - Start MVP, expand carefully

## Architecture Guidelines

### File Analysis
- Use AST analysis (Babel/ts-morph) for understanding imports, exports, and file usage
- Use Madge for dependency graph construction
- **Never use regex-based parsing** for code analysis

### Rule System
- Rule-based detection for bad file structure patterns
- Each rule must provide:
  - Detection logic
  - Explanation of the problem
  - Suggested fix with rationale

### Git Integration
- All operations must be Git-aware
- Support rollback-safe refactoring
- Check for uncommitted changes before operations

## Code Conventions

### TypeScript
- Strict mode enabled
- Explicit return types on public functions
- Prefer interfaces over type aliases for object shapes
- Use `unknown` over `any`

### Error Handling
- Use Result types or explicit error returns over throwing
- Provide actionable error messages

### Naming
- Files: kebab-case (e.g., `dependency-analyzer.ts`)
- Classes/Interfaces: PascalCase
- Functions/Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE

## Project Structure (Target)

```
src/
├── cli/           # CLI entry point and commands
├── analyzers/     # AST and dependency analysis
├── rules/         # Detection rules for bad patterns
├── suggestions/   # Suggestion generation and formatting
├── git/           # Git integration utilities
└── utils/         # Shared utilities
```

## Key Constraints

- No AI/ML components - deterministic rule-based analysis only
- No silent modifications to user code
- All suggestions must be reviewable before application
- Support dry-run mode for all operations

## Development Commands

```bash
npm run build      # Compile TypeScript
npm run dev        # Development mode with watch
npm run test       # Run test suite
npm run lint       # Lint codebase
```

## Trade-offs to Document

When making architectural decisions, explicitly document:
1. What alternatives were considered
2. Why this approach was chosen
3. Known limitations
4. Future extensibility considerations
