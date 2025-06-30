# 020. Vercel Monorepo Deployment Strategy

- **Status:** Accepted
- **Date:** December 2024

## Context

The initial deployment attempts to Vercel were failing due to a series of cascading, cryptic errors. These included npm monorepo dependency resolution failures, build stalls due to memory exhaustion, and low-level Node.js networking errors (ERR_INVALID_THIS) during the pnpm install step.

The deployment environment was encountering fundamental incompatibilities with our monorepo structure and package management strategy. Each deployment attempt revealed new layers of platform-specific issues that prevented successful builds and application startup.

## Decision

After multiple failed tactics, we made three specific, coordinated decisions to achieve a stable deployment:

### 1. Force pnpm
We created a `vercel.json` file to override the default install and build commands, explicitly enabling corepack and forcing the use of pnpm. This ensures the deployment environment uses the same package manager as our development environment.

### 2. Generate a Lockfile
We generated and committed a `pnpm-lock.yaml` file to ensure deterministic, reproducible dependency installation in the CI/CD environment. This eliminates variance in dependency resolution between local development and production deployment.

### 3. Lock the Node.js Runtime
We set a `NODE_VERSION` environment variable in Vercel to 18.x to force the use of a specific, stable LTS Node.js version, resolving the underlying networking incompatibility that was causing the ERR_INVALID_THIS errors.

## Consequences

### Positive
- **Stable Deployment Process:** A reliable and deterministic production deployment process that consistently succeeds.
- **Platform Resilience:** The build is now resilient to platform-level variations and environmental differences.
- **Reproducible Builds:** Identical dependency resolution across all environments ensures consistent behavior.
- **Production Readiness:** The application is now live and accessible in a stable production state.

### Negative
- **Platform Coupling:** We are now more tightly coupled to the Vercel platform through the `vercel.json` configuration.
- **Tool Dependency:** The project explicitly requires pnpm for its deployment environment, reducing flexibility in package manager choice.
- **Configuration Maintenance:** Additional configuration files must be maintained and kept in sync with project requirements.

This ADR documents our path from deployment failure to a live, production-ready state, serving as a critical reference for future deployment maintenance and troubleshooting. 