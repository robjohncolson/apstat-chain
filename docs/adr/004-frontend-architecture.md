# 004. Frontend Architecture

- **Status:** Accepted
- **Date:** 2024

## Context

As we implement the decentralized genesis architecture, we need to establish clear patterns for how the frontend will interact with the blockchain logic and core functionality. The UI should remain decoupled from the underlying blockchain operations to maintain separation of concerns, testability, and flexibility for future changes. Additionally, we need to standardize our approach to UI testing to ensure consistency and reliability across the frontend codebase.

## Decision

We will implement a **Service/Provider pattern** to decouple the UI from blockchain logic:

1. **Service Layer:** Core blockchain operations (transactions, key management, P2P networking) will be exposed through service interfaces that abstract away implementation details from React components.

2. **Provider Pattern:** React Context providers will manage state and expose service methods to components, ensuring a clean separation between business logic and presentation logic.

3. **Testing Standard:** All UI testing will be done via **React Testing Library**, focusing on testing user interactions and component behavior rather than implementation details.

## Consequences

**Positive:**
- The UI becomes easily testable in isolation from blockchain operations
- Business logic can be unit tested independently of React components
- Components remain focused on presentation concerns
- Future changes to core blockchain logic won't require extensive UI refactoring
- Consistent testing approach across all frontend code
- Better developer experience with clear separation of concerns

**Trade-offs:**
- Additional abstraction layer increases initial complexity
- Developers need to understand the service/provider pattern
- More boilerplate code compared to direct integration
- React Testing Library learning curve for developers unfamiliar with the library

**Implementation Notes:**
- Services should be designed with clear interfaces and minimal external dependencies
- Providers should handle loading states, error boundaries, and state management
- Tests should focus on user behavior and avoid testing implementation details
- Mock services at the provider level for component testing 