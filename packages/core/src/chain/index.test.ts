/**
 * Blockchain Chain Module Tests
 * 
 * This file serves as documentation for the chain module tests.
 * The actual test implementation is located in tests/chain.test.ts 
 * to comply with the vitest configuration that expects tests in the tests/ directory.
 * 
 * Test Coverage:
 * - Genesis Block creation and validation
 * - getLatestBlock() functionality  
 * - addBlock() with validation (signature, previousHash, transactions)
 * - isValidChain() static method for full chain validation
 * 
 * Run tests with: npm test -- tests/chain.test.ts
 */

// Re-export the Blockchain class for convenience
export { Blockchain } from './index.js'; 