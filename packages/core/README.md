# @apstat-chain/core

Core cryptographic and blockchain logic for APStat Chain.

## Features

- **Cryptographic Operations**: secp256k1 key generation, signing, and verification
- **Hashing Functions**: SHA-256, RIPEMD-160, Keccak-256, and Bitcoin-style hash functions
- **Mnemonic Support**: BIP39 mnemonic phrase generation and validation
- **TypeScript Support**: Full TypeScript support with type definitions
- **Testing**: Comprehensive test suite using Vitest

## Installation

```bash
npm install @apstat-chain/core
```

## Dependencies

- `@noble/secp256k1`: Modern cryptographic library for secp256k1 operations
- `@noble/hashes`: Secure and audited hash functions
- `bip39`: Bitcoin BIP39 mnemonic phrase generation

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API

### Cryptographic Operations

```typescript
import { generateKeyPair, sign, verify } from '@apstat-chain/core';

// Generate a new key pair
const keyPair = generateKeyPair();

// Sign a message
const signature = sign(messageHash, keyPair.privateKey);

// Verify a signature
const isValid = verify(signature, messageHash, keyPair.publicKey);
```

### Hashing Functions

```typescript
import { hash256, keccak256, bitcoinHash160 } from '@apstat-chain/core';

const data = new TextEncoder().encode('Hello, world!');
const sha256Hash = hash256(data);
const keccakHash = keccak256(data);
const btcHash = bitcoinHash160(data);
```

### Mnemonic Operations

```typescript
import { generateMnemonic, validateMnemonic, mnemonicToSeed } from '@apstat-chain/core';

// Generate a new mnemonic
const mnemonic = generateMnemonic();

// Validate a mnemonic
const isValid = validateMnemonic(mnemonic);

// Convert to seed
const seed = await mnemonicToSeed(mnemonic);
``` 