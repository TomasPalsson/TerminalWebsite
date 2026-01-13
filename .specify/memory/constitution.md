<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (Initial creation)

Added sections:
- Project Identity
- Principle 1: Code Documentation
- Principle 2: Extensibility & Modularity
- Principle 3: Type Safety & Contracts
- Principle 4: Separation of Concerns
- Principle 5: Consistent Code Style
- Governance

Templates requiring updates:
- ✅ updated: .specify/templates/plan-template.md (created with Constitution Check section)
- ✅ updated: .specify/templates/spec-template.md (created with Constitution Alignment checklist)
- ✅ updated: .specify/templates/tasks-template.md (created with principle-based task categories)

Follow-up TODOs: None
-->

# Terminal Portfolio Constitution

> The foundational principles governing development, maintenance, and evolution of this codebase.

## Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | Terminal Portfolio |
| **Description** | Interactive terminal-themed portfolio with LLM-powered tools and 3D experiences |
| **Primary Language** | TypeScript / React |
| **Constitution Version** | 1.0.0 |
| **Ratification Date** | 2026-01-12 |
| **Last Amended Date** | 2026-01-12 |

---

## Principles

### Principle 1: Code Documentation

All code MUST be self-documenting through clear naming and structure, with explicit documentation where intent is non-obvious.

**Requirements:**
- Function and component names MUST clearly describe their purpose (e.g., `ProjectCard`, `pushLine`, `extractText`)
- Complex logic MUST include inline comments explaining the "why", not the "what"
- Public interfaces (types, exported functions) MUST have JSDoc comments describing purpose, parameters, and return values
- Data structures with multiple fields MUST have type definitions with field descriptions when purpose is not self-evident

**Rationale:** Well-documented code reduces onboarding time, prevents bugs from misunderstanding, and enables confident refactoring.

### Principle 2: Extensibility & Modularity

Code MUST be structured to allow new features without modifying existing, working code (Open-Closed Principle).

**Requirements:**
- New terminal commands MUST be added by creating a new file implementing the `Command` interface and registering in `CommandMap.tsx`
- Shared logic MUST be extracted into reusable utilities in `src/utils/` or custom hooks in `src/hooks/`
- Data definitions (e.g., project lists, command metadata) MUST be separated from rendering logic
- Components MUST accept props for customization rather than hardcoding values
- Feature additions SHOULD NOT require changes to unrelated files

**Rationale:** Modular architecture enables parallel development, reduces regression risk, and makes the codebase approachable for new contributors.

### Principle 3: Type Safety & Contracts

TypeScript's type system MUST be leveraged to catch errors at compile time and document component contracts.

**Requirements:**
- All function parameters and return types MUST be explicitly typed (no implicit `any`)
- Shared interfaces MUST be defined in dedicated type files or co-located with their primary usage
- Props interfaces MUST be defined for all React components
- API responses and external data MUST be validated or typed with explicit contracts
- Union types SHOULD be used for finite sets of valid values (e.g., button variants, status states)

**Rationale:** Strong typing prevents runtime errors, serves as living documentation, and enables IDE-assisted development.

### Principle 4: Separation of Concerns

Each file, function, and component MUST have a single, well-defined responsibility.

**Requirements:**
- UI components MUST NOT contain business logic or data fetching (use hooks or utilities)
- Data transformation logic MUST be separated from rendering
- Side effects MUST be isolated in dedicated hooks or utility functions
- Styling MUST use Tailwind utilities; custom CSS MUST be avoided except for animations or complex effects
- Screen components MUST compose smaller, focused components rather than containing all logic

**Rationale:** Separation of concerns enables independent testing, reuse, and mental model clarity.

### Principle 5: Consistent Code Style

All code MUST follow the established style guide to maintain visual and structural consistency.

**Requirements:**
- Code MUST use 2-space indentation, single quotes, and no semicolons
- Components MUST use PascalCase naming (`ProjectCard.tsx`)
- Hooks MUST use `use` prefix (`useKeyClick.ts`)
- All interactive elements MUST include `transition` for hover effects
- Tailwind classes MUST be used; inline styles are prohibited
- Tests MUST be co-located with their source files as `*.test.tsx`

**Rationale:** Consistent style reduces cognitive load, simplifies code review, and prevents style-related merge conflicts.

---

## Governance

### Amendment Procedure

1. Propose changes via discussion or pull request with rationale
2. Changes MUST be reviewed for impact on existing principles
3. Version increment follows semantic versioning:
   - **MAJOR**: Principle removal or backward-incompatible redefinition
   - **MINOR**: New principle added or existing principle materially expanded
   - **PATCH**: Clarifications, typo fixes, non-semantic refinements
4. Update `Last Amended Date` to the date of change
5. Sync Impact Report MUST be updated at top of file

### Compliance Review

- Code reviews MUST verify adherence to all principles
- Violations SHOULD be flagged with reference to specific principle
- Exceptions MUST be documented with justification in code comments

### Versioning Policy

This constitution uses semantic versioning (MAJOR.MINOR.PATCH). The version number reflects the stability and evolution of the governance rules, not the project code itself.
