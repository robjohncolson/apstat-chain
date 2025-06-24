# 005. Application Assembly and MVP Flow

- **Status:** Accepted
- **Date:** 12/16/2024

## Context

We need to establish a clear orchestration pattern for the main application that manages the user experience flow and system initialization. The application must handle two distinct user states: new users who need to go through onboarding (wallet creation, key generation) and existing users who have already initialized their wallets and should access the main functionality. Additionally, we need to determine when and how to initialize the P2P networking layer to ensure it only operates for authenticated users with valid wallets.

The application flow needs to be predictable, testable, and maintainable while ensuring that sensitive operations like P2P networking are only initiated for properly authenticated users.

## Decision

We will implement a **state-driven application controller pattern** with the following architecture:

1. **App.tsx as Application Controller:** The main `App.tsx` component will act as a centralized "router" or "controller" that determines the application state based on data from the `BlockchainService`. It will be responsible for orchestrating the overall user experience flow.

2. **Conditional Rendering Based on Wallet State:** The application will conditionally render components based on the user's wallet initialization status:
   - **New Users:** Render the `OnboardingFlow` component for users who haven't created a wallet
   - **Initialized Users:** Render a `Dashboard` component for users with existing, initialized wallets

3. **Deferred P2P Network Initialization:** P2P network operations (`initializeP2P`, `discoverPeers`, `connectToPeer`) will be triggered via a `useEffect` hook only after:
   - A user's wallet is properly initialized and validated
   - The user is actively viewing the `Dashboard` component
   - This ensures networking functionality is only available to authenticated users

## Consequences

**Positive:**
- Clear separation of concerns between application orchestration and feature-specific logic
- Predictable user experience flow based on wallet state
- Security-first approach where P2P networking only initializes for valid users
- Centralized control makes the application flow easy to understand and maintain
- Testable architecture where each state can be independently verified
- Graceful handling of both new and returning users

**Trade-offs:**
- Single point of control in App.tsx could become complex as features grow
- P2P initialization is delayed until Dashboard mount, which may impact connection time
- Requires careful state management to avoid race conditions during initialization

**Implementation Notes:**
- `BlockchainService` should expose a clear API for checking wallet initialization status
- `OnboardingFlow` should handle wallet creation and notify the parent of completion
- `Dashboard` should include proper loading states during P2P initialization
- Error boundaries should be implemented to handle P2P connection failures gracefully
- Consider implementing a loading screen during the wallet state determination phase 