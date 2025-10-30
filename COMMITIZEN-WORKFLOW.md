# Commitizen Workflow Guide

## Overview

This project uses **Commitizen** with **pre-validation** to ensure code quality before commit prompts.

## Workflow Order

1. **Type checking** runs first
2. **Linting & Formatting** (lint-staged) runs on staged files
3. **Commitizen prompts** appear only if checks pass
4. **Commit** is created

## Usage

```bash
# Stage your changes
git add .

# Use the commit script (runs checks then prompts)
yarn commit
```

## What Happens Behind the Scenes

```
yarn commit
  ↓
yarn type-check (validates TypeScript)
  ↓ (if pass)
lint-staged (lints & formats staged files)
  ↓ (if pass)
commitizen (interactive prompts)
  ↓
pre-commit hook (runs again, instant since already validated)
  ↓
commit-msg hook (validates commit message format)
  ↓
✅ Commit successful!
```

## Benefits

- ✅ **Fail fast**: See errors before filling prompts
- ✅ **Auto-fix**: Lint-staged fixes issues automatically
- ✅ **Better DX**: Only see prompts when code is ready
- ✅ **No wasted effort**: Don't fill prompts if checks will fail

## Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Test changes
- **build**: Build system changes
- **ci**: CI configuration changes
- **chore**: Other changes
- **revert**: Revert previous commit

## Example Session

```bash
$ git add src/utils/logger.ts
$ yarn commit

# 1. Type checking...
yarn run v1.22.19
$ tsc --noEmit
Done in 1.42s.

# 2. Linting and formatting staged files...
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...

# 3. Commitizen prompts...
? Select the type of change: feat
? What is the scope: utils
? Write a short description: add environment-aware logger
? Provide a longer description: (press enter to skip)
? Are there any breaking changes? No
? Does this change affect any open issues? No

# 4. Creating commit...
[main abc1234] feat(utils): add environment-aware logger
 1 file changed, 67 insertions(+)
 create mode 100644 src/utils/logger.ts
```

## Alternative: Manual Commits

You can still use traditional git commits (they're validated by commitlint):

```bash
git commit -m "feat(utils): add environment-aware logger"
```

Both methods are supported!
