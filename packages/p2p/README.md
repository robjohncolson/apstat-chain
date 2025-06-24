# @apstat-chain/p2p

A peer-to-peer networking layer for APStat Chain using WebRTC and PeerJS, implementing the serverless architecture outlined in [ADR 003](../../docs/adr/003-p2p-networking-layer.md).

## Features

- **WebRTC Communication**: Real-time peer-to-peer data transmission using PeerJS
- **Transaction Broadcasting**: Efficient distribution of blockchain transactions across the network
- **Event-Driven Architecture**: EventEmitter-based API for handling network events
- **Connection Management**: Automatic tracking and cleanup of peer connections
- **Error Handling**: Graceful handling of connection failures and malformed messages

## Installation

```bash
npm install @apstat-chain/p2p
```

## Usage

```typescript
import { P2PNode } from '@apstat-chain/p2p';
import { createTransaction } from '@apstat-chain/core';

// Initialize a P2P node
const node = new P2PNode();

// Listen for transaction events
node.on('transaction:received', (transaction) => {
  console.log('Received transaction:', transaction.id);
});

// Connect to other peers
node.connectToPeer('peer-id-here');

// Broadcast a transaction to all connected peers
const transaction = createTransaction(privateKey, { action: 'transfer', amount: 100 });
node.broadcastTransaction(transaction);
```

## API Reference

### P2PNode

The main class for managing peer-to-peer connections and transaction broadcasting.

#### Constructor

```typescript
new P2PNode(peerId?: string)
```

- `peerId` (optional): Custom peer ID. If not provided, PeerJS will generate one automatically.

#### Methods

##### `connectToPeer(peerId: string): void`

Initiates a connection to another peer.

##### `broadcastTransaction(transaction: Transaction): void`

Broadcasts a transaction to all connected peers.

##### `getPeerId(): string | null`

Returns the current peer's ID, or null if not yet available.

##### `getConnectedPeers(): string[]`

Returns an array of connected peer IDs.

##### `isConnectedToPeer(peerId: string): boolean`

Checks if connected to a specific peer.

##### `disconnectFromPeer(peerId: string): void`

Disconnects from a specific peer.

##### `destroy(): void`

Closes all connections and destroys the peer instance.

#### Events

The P2PNode extends EventEmitter and emits the following events:

- `ready(peerId: string)`: Emitted when the peer is ready and has an ID
- `transaction:received(transaction: Transaction)`: Emitted when a transaction is received
- `peer:connected(peerId: string)`: Emitted when a new peer connects
- `peer:disconnected(peerId: string)`: Emitted when a peer disconnects
- `connection:error(error: { peer: string, error: Error })`: Emitted on connection errors
- `message:received(message: { type: string, data: any, fromPeer: string })`: Emitted for non-transaction messages
- `error(error: Error)`: Emitted on general peer errors

## Testing

The package includes comprehensive test coverage using Vitest with mocked PeerJS dependencies:

```bash
npm test
```

Tests cover:
- PeerJS initialization
- Peer connection establishment
- Transaction broadcasting to multiple peers
- Transaction reception and event emission
- Error handling and graceful degradation
- Connection lifecycle management

## Architecture

This package implements the serverless P2P architecture as defined in ADR 003:

- **WebRTC Communication**: Uses PeerJS for simplified WebRTC data channels
- **Event-Driven Design**: Built on Node.js EventEmitter for reactive programming
- **Browser Compatible**: Designed to work in both Node.js and browser environments
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Dependencies

- `@apstat-chain/core`: Core blockchain logic and transaction types
- `peerjs`: WebRTC abstraction layer for peer-to-peer communication
- `events`: Node.js EventEmitter for event handling

## License

MIT 