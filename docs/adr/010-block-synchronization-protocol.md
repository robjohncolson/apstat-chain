# 010. Block Synchronization Protocol

- **Status:** Accepted
- **Date:** 6/26/2025

## Context

Peers can broadcast and receive individual transactions. Now that transactions are bundled into blocks, we need a mechanism for peers to share and validate entire blocks to keep their chains synchronized.

## Decision

When a peer successfully mines a new block, they will broadcast the entire `Block` object to the network. We will add a new P2P message type, `BLOCK_BROADCAST`. When a peer receives a new block, they will attempt to add it to their local blockchain instance. If it's valid and connects to their current chain, they will accept it. We will also implement a simple "longest chain wins" rule for resolving conflicts.

## Consequences

**Positive:**
- Ensures all peers converge on the same chain history
- Simple to implement

**Negative:**
- Inefficient for large blocks (we're broadcasting the whole thing)
- Vulnerable to simple spam attacks without a consensus mechanism (which we will address in Phase 2) 