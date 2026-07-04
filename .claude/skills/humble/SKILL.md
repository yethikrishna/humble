```markdown
# humble Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill provides guidance on contributing to the `humble` TypeScript codebase. It documents the project's coding conventions, commit message patterns, and testing strategies. By following these patterns, contributors can ensure consistency and maintainability throughout the repository.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `dataFetcher.ts`

### Import Style
- Use **alias imports** to reference modules.
  - Example:
    ```typescript
    import utils from '@utils';
    import { fetchData } from '@services/dataService';
    ```

### Export Style
- Both **default** and **named exports** are used.
  - Example (default export):
    ```typescript
    export default function doSomething() { /* ... */ }
    ```
  - Example (named export):
    ```typescript
    export function calculateSum(a: number, b: number) { /* ... */ }
    ```

### Commit Messages
- Follow the **Conventional Commits** standard.
- Use the `feat` prefix for new features.
- Keep commit messages concise (average length: 76 characters).
  - Example:
    ```
    feat: add user authentication middleware
    ```

## Workflows

### Feature Development
**Trigger:** When adding a new feature  
**Command:** `/feature-development`

1. Create a new branch for your feature.
2. Implement the feature following coding conventions.
3. Write or update relevant tests (`*.test.*` files).
4. Commit changes using the `feat` prefix and a concise message.
5. Open a pull request for review.

### Testing
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Identify or create test files matching the `*.test.*` pattern.
2. Run the test suite using the project's preferred test runner.
3. Ensure all tests pass before committing changes.

## Testing Patterns

- Test files are named using the pattern `*.test.*` (e.g., `userService.test.ts`).
- The specific testing framework is unknown; check existing test files for guidance.
- Place test files alongside the code they test or in a dedicated `tests` directory.

  Example test file:
  ```typescript
  // userService.test.ts
  import { getUser } from './userService';

  test('should fetch user by ID', () => {
    const user = getUser(1);
    expect(user.id).toBe(1);
  });
  ```

## Commands
| Command               | Purpose                                 |
|-----------------------|-----------------------------------------|
| /feature-development  | Start a new feature development workflow|
| /run-tests            | Run the test suite                      |
```