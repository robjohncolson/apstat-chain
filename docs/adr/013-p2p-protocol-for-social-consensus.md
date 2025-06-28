# 013. P2P Protocol for Social Consensus

- **Status:** Accepted
- **Date:** 6/27/2025

## Context

Our consensus model now requires a multi-step process: a "Miner" proposes a candidate block, and "Attesters" validate it by broadcasting signatures. Our current P2P protocol only supports broadcasting final blocks and cannot handle this new workflow.

## Decision

We will introduce two new P2P message types:

1. **`CANDIDATE_BLOCK_PROPOSAL`**: The message sent by a Miner. Its payload will be a `Block` object that includes the `puzzleId` and `proposedAnswer`, but its `attestations` array will be empty.

2. **`ATTESTATION_BROADCAST`**: The message sent by an Attester after they have verified a candidate block. Its payload will be the `Attestation` object they created and signed.

The `P2PNode` class will be upgraded to send and receive these new messages, emitting corresponding events (`candidate-block:received`, `attestation:received`) for the `BlockchainService` to handle.

## Consequences

**Positive:**
- Creates a clear and explicit protocol for the multi-step block finalization process
- Decouples the networking layer from the consensus logic; the `P2PNode` just passes messages, and the `BlockchainService` enforces the rules

**Negative:**
- Significantly increases network chatter. For every one block finalized, there will be 1 `CANDIDATE_BLOCK_PROPOSAL` and N `ATTESTATION_BROADCAST` messages. (This is acceptable for our scale) 