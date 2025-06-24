@code
<<<<<<< Updated upstream

=======
<<<<<<< HEAD

=======
>>>>>>> 27bd7bf933c2a2995cd9b4dacd3ed179d2c49dce
>>>>>>> Stashed changes
Now, open the file `docs/adr/001-decentralized-genesis-architecture.md` and populate it with a summary of the architectural pillars we just decided on.

# 001. Decentralized Genesis Architecture

*   **Status:** Accepted
*   **Date:** (Today's Date)

## Context

The initial prototype of the application, while functional, became difficult to maintain and relied on a complex mix of technologies and a partially-deprecated central server. A complete, disciplined rebuild is needed to create a resilient, simple, and maintainable foundation for the future.

## Decision

We will rebuild the application from the ground up on a new feature branch (`feature/decentralized-genesis`) following three core architectural pillars:

1.  **Testing Strategy: No Automated E2E.** We will rely exclusively on fast and reliable unit and integration tests (Vitest + React Testing Library). Final cross-device validation will be performed manually before releases. This prioritizes development speed and simplicity over comprehensive but brittle E2E automation.

2.  **Identity Management: Mnemonic Phrase.** User identity will be self-sovereign, managed via a 12-word mnemonic phrase. This empowers users, provides an educational opportunity, and removes the need for a central user database. Recovery is handled by the user, with the teacher able to provide a low-tech "social backup" if the phrase is shared with them.

3.  **Networking Model: Pure P2P with DNS Seeding.** The application will be a purely static frontend with no active backend server. Peer discovery will be handled via DNS `TXT` records. This makes the application maximally resilient and simple, as it has no central point of failure for its core P2P functionality.

## Consequences

*   The entire application can be hosted on simple, static hosting providers (e.g., Vercel, Netlify, GitHub Pages).
*   The system becomes highly resilient to outages, as its core functionality does not depend on a single server we maintain.
*   The development process is simplified, with a clear separation between core logic, networking, and the UI.
*   The responsibility for key management is shifted entirely to the user, which is a conscious design trade-off for decentralization.