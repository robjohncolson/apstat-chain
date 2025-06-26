# 009. Blockchain Structure

- **Status:** Accepted
- **Date:** 6/26/2025




## Context

The application currently manages a simple, unordered list of all transactions seen on the network (a "mempool"). To ensure ordered, tamper-resistant history and prepare for consensus rules, we need a formal chain structure.

## Decision

We will implement a `Blockchain` class in the `@apstats/core` package. This class will manage an array of `Block` objects. Each block will contain a list of transactions and the hash of the preceding block, creating a cryptographic chain. The chain will start with a hardcoded "Genesis Block." All block and chain validation logic (e.g., ensuring `previousHash` matches, verifying signatures) will be centralized in this class.

## Consequences

**Positive:**
- Establishes a formal, verifiable ledger
- Simplifies state synchronization between peers
- Creates a foundation for implementing consensus mechanisms
- Provides cryptographic integrity through block linking
- Centralizes validation logic for maintainability

**Negative:**
- Increases the complexity of adding new transactions, as they must now be bundled into blocks
- Requires additional memory and storage for maintaining the full chain
- Introduces new failure modes related to chain validation and integrity checks 