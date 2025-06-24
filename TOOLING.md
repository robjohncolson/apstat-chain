# Development Tooling

This document outlines the development tooling setup for the APStat Chain monorepo.

## Overview

The project uses a comprehensive tooling setup to ensure code quality, consistency, and developer productivity:

- **TypeScript**: Strict type checking with modern ES2022 features
- **ESLint**: Code linting for TypeScript and React
- **Prettier**: Code formatting
- **VS Code**: Integrated development environment configuration

## TypeScript Configuration

### Root Configuration (`tsconfig.json`)

The root TypeScript configuration provides:

- **Strict Type Checking**: All strict mode options enabled
- **Modern JavaScript**: ES2022 target with latest features
- **Module Resolution**: Bundler-style resolution for modern tools
- **Path Mapping**: Convenient imports with `@/*` and `@apstat/*` aliases
- **JSX Support**: React JSX with automatic runtime

### Key Features

- `strict: true` - Enable all strict type checking options
- `noUncheckedIndexedAccess: true` - Safer array/object access
- `exactOptionalPropertyTypes: true` - Stricter optional properties
- `noUnusedLocals` and `noUnusedParameters` - Clean code enforcement

## ESLint Configuration

### Extends

- **@typescript-eslint/recommended**: TypeScript-specific rules
- **plugin:react/recommended**: React best practices
- **plugin:react-hooks/recommended**: React Hooks rules
- **plugin:jsx-a11y/recommended**: Accessibility guidelines
- **plugin:import/recommended**: Import/export best practices
- **prettier**: Disables formatting rules (handled by Prettier)

### Key Rules

- Import organization with automatic sorting
- Strict TypeScript rules for type safety
- React best practices (no prop-types needed)
- Accessibility enforcement
- Consistent code style

## Prettier Configuration

### Settings (`.prettierrc.json`)

- **Semi**: true (semicolons required)
- **Single Quote**: true (prefer single quotes)
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Trailing Comma**: ES5 compatible
- **Arrow Parens**: avoid when possible

## Available Scripts

### Root Level Scripts

```bash
# Type checking
npm run type-check          # Check types without emitting
npm run type-check:watch    # Watch mode type checking

# Linting
npm run lint                # Lint all files
npm run lint:fix           # Lint and auto-fix issues
npm run lint:workspaces    # Lint each workspace individually

# Formatting
npm run format             # Format all supported files
npm run format:check       # Check if files are formatted

# Combined checks
npm run check-all          # Run type-check + lint + format:check

# Development
npm run dev                # Start development servers in all workspaces
npm run build              # Build all workspaces
npm run test               # Run tests in all workspaces
npm run clean              # Clean build artifacts and caches
```

## VS Code Integration

### Extensions Recommended

- **ESLint**: Real-time linting
- **Prettier**: Code formatting
- **TypeScript and JavaScript Language Features**: Enhanced TypeScript support

### Workspace Settings

The `.vscode/settings.json` file configures:

- Format on save with Prettier
- Auto-fix ESLint issues on save
- Organize imports on save
- Multi-root workspace support for monorepo
- Optimized file search and exclusions

## Workflow

### Daily Development

1. **Code**: Write TypeScript/React code with full IntelliSense
2. **Save**: Files are automatically formatted and linted
3. **Commit**: Run `npm run check-all` before committing

### Before Pull Requests

```bash
# Ensure everything passes
npm run check-all

# Fix any issues
npm run lint:fix
npm run format
```

### Adding New Workspaces

When adding new packages or apps:

1. Create workspace-specific `tsconfig.json` extending the root config
2. ESLint will automatically pick up the new workspace
3. All scripts will work across workspaces

## Customization

### Per-Workspace Overrides

Individual workspaces can extend the root configuration:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

### ESLint Overrides

Add workspace-specific rules in local `.eslintrc.js` files that extend the root configuration.

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Run `npm run type-check` to see detailed errors
2. **Import Resolution**: Check path mappings in `tsconfig.json`
3. **ESLint Cache**: Delete `.eslintcache` if rules aren't updating
4. **VS Code**: Restart TypeScript language service if IntelliSense breaks

### Performance

- ESLint caching is enabled for faster subsequent runs
- TypeScript uses incremental compilation
- File exclusions optimize search and watch performance
