# 002. Core Logic and Cryptography

- **Status:** Accepted
- **Date:** (Today's Date)

## Context

As part of the decentralized genesis architecture, we need to establish the foundational data structures and cryptographic primitives for the application. This includes defining immutable transaction structures for the blockchain-like functionality and implementing secure identity management through mnemonic phrases and keypairs. The choice of cryptographic libraries and testing frameworks will significantly impact the security, maintainability, and reliability of the entire system.

## Decision

We will implement the core logic and cryptography layer using the following technologies:

1. **Immutable Data Structures (Transactions):** We will define clear, immutable transaction structures that form the backbone of our blockchain-like data model. These structures will be designed to be cryptographically verifiable and tamper-evident.

2. **Identity Management:** User identity will be managed through:
   - **Mnemonic Phrases:** 12-word mnemonic phrases for human-readable key recovery
   - **Keypairs:** Cryptographic keypairs derived from mnemonic phrases for signing and verification

3. **Cryptographic Library:** We will use `@noble` libraries for all cryptographic operations. The `@noble` suite provides:
   - Audited, lightweight, and secure cryptographic primitives
   - Pure JavaScript implementations with no native dependencies
   - Excellent TypeScript support
   - Wide compatibility across different environments

4. **Testing Framework:** We will use `Vitest` for testing all core logic and cryptographic functions, ensuring:
   - Fast test execution
   - Comprehensive test coverage of cryptographic operations
   - Integration with our existing TypeScript/Vite toolchain

## Consequences

**Positive:**
- The `@noble` libraries provide battle-tested, audited cryptographic implementations that reduce security risks
- Pure JavaScript implementation ensures broad compatibility and eliminates dependency on native cryptographic libraries
- Immutable data structures provide clear guarantees about data integrity and simplify reasoning about state changes
- Vitest integration ensures our cryptographic operations are thoroughly tested with fast feedback loops
- TypeScript support throughout the stack provides compile-time safety for cryptographic operations

**Trade-offs:**
- Dependence on external cryptographic libraries requires staying current with security updates
- Self-sovereign identity management places the burden of key management entirely on users
- Immutable data structures may require more memory and storage compared to mutable alternatives
- The learning curve for developers unfamiliar with cryptographic concepts may be steeper

**Becomes Easier:**
- Verifying the integrity and authenticity of all transactions
- Implementing secure peer-to-peer communication
- Testing cryptographic functionality with fast, reliable unit tests
- Reasoning about data flow and state management with immutable structures

**Becomes Harder:**
- Recovering from lost mnemonic phrases (intentional trade-off for decentralization)
- Debugging cryptographic operations (requires specialized knowledge)
- Managing the complexity of key derivation and cryptographic workflows 