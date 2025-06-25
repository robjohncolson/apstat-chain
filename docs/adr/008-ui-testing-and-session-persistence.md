# ADR-008: "Back to Basics" UI Testing Strategy

## Status
Accepted

## Context

Our initial attempts to write high-level integration tests for UI components like `App.tsx` proved to be brittle and overly complex. The primary challenge was the difficulty of mocking a singleton service (`BlockchainService`) provided through React Context, leading to tests that were hard to maintain and unreliable. This complexity was hindering our ability to build a stable and well-tested UI layer.

## Decision: Pivot to a Simplified Testing Strategy

To address these challenges and establish a more robust testing foundation, we are pivoting to a "Back to Basics" unit testing strategy.

1.  **Abandon High-Level Integration Tests (For Now):** We will halt efforts to write complex integration tests for components that are deeply coupled with context-provided services.

2.  **Focus on Low-Level Unit Tests:** Our primary focus will be on writing simple, isolated unit tests for individual React components. This allows us to verify component behavior in a controlled environment.

3.  **Refactor to "Dumb" Presentation Components:** Components responsible for displaying data, such as `Dashboard.tsx`, will be refactored into "dumb" presentation components. They will receive all required data and callback functions as props, eliminating internal state management and hook-based data fetching. This decoupling makes them significantly easier to test.

4.  **Test Component "Contracts":** The goal of our unit tests will be to verify a component's "contract." For a given set of props, we will assert that:
    - The component renders the expected output.
    - The correct callback functions are invoked in response to user interactions.

We will explicitly avoid mocking the entire application state or complex service dependencies in these unit tests.

## Consequences

### Positive
- **Simpler and Faster Tests:** Unit tests are less complex, faster to write, and quicker to run compared to our previous integration tests.
- **Increased Stability:** By testing components in isolation, our test suite becomes more stable and less prone to breaking from unrelated changes.
- **Improved Confidence:** We can build high confidence in the correctness of our individual UI building blocks.

### Negative
- **Lack of Integration Coverage:** This strategy does not verify the integration between the `BlockchainService` and the UI components. This is a deliberate trade-off.
- **Reliance on Manual E2E Testing:** For the time being, the correctness of the service-to-component integration will be validated through manual end-to-end testing during the development and QA process.

### Neutral
- **Clear Separation of Concerns:** This approach encourages better component design, promoting a clear separation between data/logic containers and simple presentation components. 