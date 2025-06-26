# 011. Chain Synchronization Protocol

- **Status:** Accepted
- **Date:** 6/26/2025

## Context

When a peer receives a block that creates a fork (i.e., its `previousHash` doesn't match the latest block), they have no way to resolve the conflict.

## Decision

We will introduce a chain synchronization protocol. The `P2PNode` will be updated to handle two new message types: `GET_CHAIN_REQUEST` and `CHAIN_RESPONSE`. When a conflict occurs, a peer will request the full chain from the sender of the conflicting block. The receiving peer will respond with their current, full blockchain.

## Consequences

**Positive:**
- Provides a simple mechanism to resolve forks and converge on the longest chain

**Negative:**
- Inefficient, as it involves sending the entire chain over the network (this is acceptable for our current scale) 