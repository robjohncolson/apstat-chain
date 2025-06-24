# 000. Use Markdown for Architectural Decision Records

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
*   **Status:** Accepted
*   **Date:** (Today's Date)

## Context

We need a lightweight way to document the important architectural decisions made during the project's development. This will help us remember the "why" behind our choices and provide a clear history of the project's evolution. The process should be simple and live within the codebase itself.

## Decision

We will use Markdown files for our Architectural Decision Records (ADRs), stored in the `/docs/adr` directory.

Each ADR will be a separate `.md` file, numbered sequentially (e.g., `001-some-decision.md`).

The structure of each ADR will include:
*   **Title:** A short, descriptive title.
*   **Status:** One of: `Proposed`, `Accepted`, `Deprecated`, `Superseded by ADR-XXX`.
*   **Context:** What is the problem or situation that requires a decision?
*   **Decision:** What is the change we are choosing to make?
*   **Consequences:** What are the results of this decision? What becomes easier? What becomes harder? What are the trade-offs we are accepting?

## Consequences

*   Our decision-making process will become more deliberate and transparent.
*   The project will have a "living" documentation that evolves alongside the code.
*   Onboarding future collaborators (or reminding our future selves) will be much easier.