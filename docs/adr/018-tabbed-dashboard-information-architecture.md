# 018. Tabbed Dashboard Information Architecture

- **Status:** Accepted
- **Date:** 2024-12-27

## Context

The current dashboard displays all UI components—network status, mining, attestation, mempool, ledger, and leaderboard—in a single, long column. As the application's feature set has grown, this layout has become cluttered and lacks clear organization. Users are overwhelmed with too much information at once, and it's difficult to find specific functionality or understand the logical groupings of features.

The monolithic dashboard approach doesn't scale well as we continue to add new features, and the user experience suffers from cognitive overload and poor information hierarchy.

## Decision

We will refactor the `Dashboard.tsx` component to use a top-level tabbed navigation system. This will organize the application's features into three distinct contexts:

1. **"Network Activity" Tab:** This will be the default view. It will contain the components related to the real-time state of the P2P network, including the `Network Progress` bar, the `MiningView` (when active), the `AttestationView`, and the `MempoolView`.

2. **"My Progress" Tab:** This tab will focus on the user's personal journey and official record. It will contain the `Ledger` of all confirmed transactions. (In the future, this is where the `Unit Accordion` from previous designs would go).

3. **"Leaderboard" Tab:** This tab will be dedicated to the `Leaderboard` component, showing the official rankings based on confirmed, on-chain data.

The tabbed interface will be implemented using a clean, accessible design with clear visual indicators for the active tab and smooth transitions between contexts.

## Consequences

### Positive

- **Improved Information Architecture:** Creates a clean, organized, and scalable information architecture. It's easy to add new features into the appropriate tab in the future.
- **Enhanced User Experience:** Improves user experience by reducing cognitive load. Users can focus on one context at a time (e.g., "I want to see my progress" vs. "I want to participate in the network").
- **Better Scalability:** Future features can be logically grouped into existing tabs or new tabs can be added without disrupting the overall layout.
- **Clearer Mental Model:** Users will develop a clearer understanding of the different aspects of the application and can navigate more intuitively.

### Negative

- **Added Complexity:** Adds a small amount of complexity to the `Dashboard` component, which will now need to manage the active tab state. This is a minimal and acceptable trade-off.
- **Navigation Overhead:** Users will need to click between tabs to access different functionality, though this is mitigated by having logical groupings and setting "Network Activity" as the default.

### Neutral

- **Refactoring Effort:** Requires reorganizing existing components and implementing the tabbed interface, but this is a one-time cost for long-term benefits. 