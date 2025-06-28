# 015. Mempool Synchronization Protocol

- **Status:** Accepted
- **Date:** 4/28/2025

## Context

When a peer joins the network (or refreshes their page), their local mempool is empty. They are unaware of pending transactions that other peers know about, leading to an inconsistent state and preventing them from participating in mining until they create a new transaction themselves.

## Decision

We will implement a simple mempool synchronization mechanism that piggybacks on the existing peer connection handshake.

1. When Peer A successfully connects to Peer B, Peer A will immediately send a `MEMPOOL_REQUEST` message to Peer B.
2. Upon receiving this request, Peer B will respond with a `MEMPOOL_RESPONSE` message, containing their entire current array of pending transactions.
3. When Peer A receives the `MEMPOOL_RESPONSE`, it will merge the received transactions into its own local mempool, discarding any duplicates. This ensures the newly joined peer gets a complete view of the network's pending state.

## Consequences

**Positive:**
- Ensures all peers quickly converge on a consistent mempool state, improving network health and user experience
- Reuses the existing connection handshake, making it efficient and simple to implement

**Negative:**
- Slightly increases the amount of data exchanged upon initial peer connection (this is acceptable) 