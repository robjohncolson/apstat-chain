# 015. Mempool Synchronization Protocol

- **Status:** Accepted
- **Date:** 4/28/2025

## Context

When a peer joins the network (or refreshes their page), their local mempool is empty. They are unaware of pending transactions that other peers know about, leading to an inconsistent state and preventing them from participating in mining until they create a new transaction themselves.

## Decision

We will implement a simple "welcome wagon" mempool synchronization mechanism that proactively shares mempool state when new connections are established.

1. When Peer A successfully connects to Peer B, Peer A will immediately send two messages to Peer B:
   - First, a `PEER_LIST` message with its known peers
   - Second, a `MEMPOOL_RESPONSE` message containing its entire current array of pending transactions
2. When Peer B receives the `MEMPOOL_RESPONSE`, it will merge the received transactions into its own local mempool, discarding any duplicates. This ensures the newly joined peer gets a complete view of the network's pending state.
3. The `P2PNode` uses a mempool getter function provided by the `BlockchainService` to access current pending transactions when needed.

## Consequences

**Positive:**
- Eliminates race conditions where both peers simultaneously request each other's mempool state
- Ensures all peers quickly converge on a consistent mempool state, improving network health and user experience
- Simpler one-way protocol that's easier to reason about and debug
- Reuses the existing connection handshake, making it efficient to implement

**Negative:**
- Slightly increases the amount of data exchanged upon initial peer connection (this is acceptable) 