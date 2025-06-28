import type { Transaction, Attestation } from '@apstat-chain/core';
import { peerIdFromPublicKey, type KeyPair, type Block } from '@apstat-chain/core';
import { EventEmitter } from 'eventemitter3';
import { Peer, type DataConnection } from 'peerjs';

export interface P2PMessage {
  type: string;
  data: any;
}

export interface PeerListMessage extends P2PMessage {
  type: 'peer-list';
  data: string[]; // An array of peer IDs
}

export interface TransactionMessage extends P2PMessage {
  type: 'transaction';
  data: Transaction;
}

export interface BlockMessage extends P2PMessage {
  type: 'block';
  data: Block;
}

export interface ChainRequestMessage extends P2PMessage {
  type: 'GET_CHAIN_REQUEST';
  data: null; // No data needed for the request
}

export interface ChainResponseMessage extends P2PMessage {
  type: 'CHAIN_RESPONSE';
  data: any; // The chain data
}

export interface CandidateBlockMessage extends P2PMessage {
  type: 'CANDIDATE_BLOCK_PROPOSAL';
  data: Block;
}

export interface AttestationMessage extends P2PMessage {
  type: 'ATTESTATION_BROADCAST';
  data: Attestation;
}

export interface P2PNodeConfig {
  host?: string;
  port?: number;
  path?: string;
}

export class P2PNode extends EventEmitter {
  private handlePeerList(message: PeerListMessage): void {
    const remotePeers = message.data;
    console.log(`[P2P HANDLE] Processing peer list:`, remotePeers);

    console.log('Received peer list:', remotePeers);
    for (const peerId of remotePeers) {
      console.log(`[P2P HANDLE] Checking peer ${peerId}. Am I connected? ${this.isConnectedToPeer(peerId)}`);

      if (peerId !== this.getPeerId() && !this.isConnectedToPeer(peerId)) {
        console.log(`[P2P HANDLE] Not connected to ${peerId}. Initiating connection.`);

        this.connectToPeer(peerId);
      }
    }
  }
  private peer: Peer;
  private connections: Map<string, DataConnection> = new Map();

  constructor(keyPair: KeyPair, config?: P2PNodeConfig) {
    super();
    const derivedId = peerIdFromPublicKey(keyPair.publicKey);
    
    // Use config if provided, otherwise use environment variables or defaults
    const peerConfig: any = {};
    if (config?.host) {
      peerConfig.host = config.host;
    }
    if (config?.port) {
      peerConfig.port = config.port;
    }
    if (config?.path) {
      peerConfig.path = config.path;
    }
    
    // Only set configuration if at least one custom value is provided
    this.peer = Object.keys(peerConfig).length > 0 
      ? new Peer(derivedId, peerConfig)
      : new Peer(derivedId);
    
    this.setupPeerEventHandlers();
  }

  private setupPeerEventHandlers(): void {
    this.peer.on('open', (id: string) => {
      console.log(`P2P Node initialized with ID: ${id}`);
      this.emit('ready', id);
    });

    this.peer.on('connection', (conn: DataConnection) => {
      console.log(`Incoming connection from: ${conn.peer}`);
      this.setupConnectionEventHandlers(conn);
    });

    this.peer.on('error', (error: Error) => {
      console.error('P2P Error:', error);
      this.emit('error', error);
    });
  }

  private setupConnectionEventHandlers(conn: DataConnection): void {
    //conn.on('open', () => {
    //  console.log(`Connection opened with: ${conn.peer}`);
    //  this.connections.set(conn.peer, conn);
    //  this.emit('peer:connected', conn.peer);
    //});
    conn.on('open', () => {
      console.log(`Connection opened with: ${conn.peer}`);
      this.connections.set(conn.peer, conn);
      this.emit('peer:connected', conn.peer);
    
      // INTRODUCE YOURSELF: Send your known peers to the new connection.
      const peerListMessage: PeerListMessage = {
        type: 'peer-list',
        data: this.getConnectedPeers()
      };
       // ADD THIS LOG:
  console.log(`[P2P SEND] Sending peer list to ${conn.peer}:`, peerListMessage.data);
  conn.send(peerListMessage);
    });
    conn.on('data', (data: any) => {
      this.handleIncomingData(data, conn.peer);
    });

    conn.on('close', () => {
      console.log(`Connection closed with: ${conn.peer}`);
      this.connections.delete(conn.peer);
      this.emit('peer:disconnected', conn.peer);
    });

    conn.on('error', (error: Error) => {
      console.error(`Connection error with ${conn.peer}:`, error);
      this.connections.delete(conn.peer);
      this.emit('connection:error', { peer: conn.peer, error });
    });
  }

  private handleIncomingData(data: any, fromPeer: string): void {
    console.log(`[P2P RECV] Received data from ${fromPeer}:`, data);
    try {
      // Validate message structure
      if (!data || typeof data !== 'object' || !data.type) {
        console.warn('Received malformed message from', fromPeer);
        return;
      }

      const message = data as P2PMessage;

      switch (message.type) {
        case 'transaction':
          this.handleTransaction(message as TransactionMessage, fromPeer);
          break;
        case 'block':
          this.handleBlock(message as BlockMessage, fromPeer);
          break;
        case 'peer-list':
          this.handlePeerList(message as PeerListMessage);
          break;
        case 'GET_CHAIN_REQUEST':
          this.handleChainRequest(message as ChainRequestMessage, fromPeer);
          break;
        case 'CHAIN_RESPONSE':
          this.handleChainResponse(message as ChainResponseMessage, fromPeer);
          break;
        case 'CANDIDATE_BLOCK_PROPOSAL':
          this.handleCandidateBlock(message as CandidateBlockMessage, fromPeer);
          break;
        case 'ATTESTATION_BROADCAST':
          this.handleAttestation(message as AttestationMessage, fromPeer);
          break;
        default:
          console.log(`Received unknown message type: ${message.type} from ${fromPeer}`);
          this.emit('message:received', { type: message.type, data: message.data, fromPeer });
      }
    } catch (error) {
      console.error('Error handling incoming data:', error);
    }
  }

  private handleTransaction(message: TransactionMessage, fromPeer: string): void {
    console.log(`Received transaction ${message.data.id} from ${fromPeer}`);
    const transaction = this.deserializeTransaction(message.data);
    this.emit('transaction:received', transaction);
  }

  private handleBlock(message: BlockMessage, fromPeer: string): void {
    console.log(`Received block ${message.data.id} from ${fromPeer}`);
    const block = this.deserializeBlock(message.data);
    this.emit('block:received', block, fromPeer);
  }

  private handleChainRequest(message: ChainRequestMessage, fromPeer: string): void {
    console.log(`Received chain request from ${fromPeer}`);
    this.emit('chain-request:received', fromPeer);
  }

  private handleChainResponse(message: ChainResponseMessage, fromPeer: string): void {
    console.log(`Received chain response from ${fromPeer}`);
    this.emit('chain:received', message.data);
  }

  private handleCandidateBlock(message: CandidateBlockMessage, fromPeer: string): void {
    console.log(`Received candidate block ${message.data.id} from ${fromPeer}`);
    const block = this.deserializeBlock(message.data);
    this.emit('candidate-block:received', block);
  }

  private handleAttestation(message: AttestationMessage, fromPeer: string): void {
    console.log(`Received attestation for puzzle ${message.data.puzzleId} from ${fromPeer}`);
    const attestation = this.deserializeAttestation(message.data);
    this.emit('attestation:received', attestation);
  }

  public connectToPeer(peerId: string): void {
    if (this.connections.has(peerId)) {
      console.log(`Already connected to peer: ${peerId}`);
      return;
    }

    console.log(`Connecting to peer: ${peerId}`);
    const conn = this.peer.connect(peerId);
    this.setupConnectionEventHandlers(conn);
  }

  // Helper function to serialize transactions for network transmission
  private serializeTransaction(transaction: Transaction): any {
    try {
      // Handle both old and new transaction structures
      const txCopy = { ...transaction } as any;
      
      // If signature is an object with bigint values (old structure), convert to string
      if (typeof txCopy.signature === 'object' && txCopy.signature !== null && 'r' in txCopy.signature) {
        txCopy.signature = {
          r: txCopy.signature.r.toString(),
          s: txCopy.signature.s.toString(),
          recovery: txCopy.signature.recovery
        };
      }
      
      return txCopy;
    } catch (error) {
      console.error('Error serializing transaction:', error);
      throw new Error('Failed to serialize transaction');
    }
  }

  // Helper function to deserialize transactions from network transmission
  private deserializeTransaction(data: any): Transaction {
    try {
      let transaction = data;
      
      // Parse string data if needed
      if (typeof data === 'string') {
        transaction = JSON.parse(data);
      }
      
      // If signature is an object with string values (serialized old structure), convert back to bigint
      if (typeof transaction.signature === 'object' && transaction.signature !== null && 'r' in transaction.signature) {
        transaction.signature = {
          r: BigInt(transaction.signature.r),
          s: BigInt(transaction.signature.s),
          recovery: transaction.signature.recovery
        };
      }
      
      return transaction;
    } catch (error) {
      console.error('Error deserializing transaction:', error);
      throw new Error('Failed to deserialize transaction');
    }
  }

  public broadcastTransaction(transaction: Transaction): void {
    const serializedTransaction = this.serializeTransaction(transaction);
    const message: TransactionMessage = {
      type: 'transaction',
      data: serializedTransaction
    };

    const connectedPeers = Array.from(this.connections.keys());
    console.log(`Broadcasting transaction ${transaction.id} to ${connectedPeers.length} peers`);

    for (const [peerId, conn] of this.connections) {
      try {
        if (conn.open) {
          conn.send(message);
          console.log(`Sent transaction ${transaction.id} to ${peerId}`);
        }
      } catch (error) {
        console.error(`Failed to send transaction to ${peerId}:`, error);
        // Don't remove connection here, let the error handler deal with it
      }
    }
  }

  // Helper function to serialize blocks for network transmission
  private serializeBlock(block: Block): any {
    try {
      // Block structure is simple, just copy it
      const blockCopy = { ...block };
      return blockCopy;
    } catch (error) {
      console.error('Error serializing block:', error);
      throw new Error('Failed to serialize block');
    }
  }

  // Helper function to serialize attestations for network transmission
  private serializeAttestation(attestation: Attestation): any {
    try {
      // Attestation structure is simple, just copy it
      const attestationCopy = { ...attestation };
      return attestationCopy;
    } catch (error) {
      console.error('Error serializing attestation:', error);
      throw new Error('Failed to serialize attestation');
    }
  }

  // Helper function to deserialize blocks from network transmission
  private deserializeBlock(data: any): Block {
    try {
      let block = data;
      
      // Parse string data if needed
      if (typeof data === 'string') {
        block = JSON.parse(data);
      }
      
      return block;
    } catch (error) {
      console.error('Error deserializing block:', error);
      throw new Error('Failed to deserialize block');
    }
  }

  // Helper function to deserialize attestations from network transmission
  private deserializeAttestation(data: any): Attestation {
    try {
      let attestation = data;
      
      // Parse string data if needed
      if (typeof data === 'string') {
        attestation = JSON.parse(data);
      }
      
      return attestation;
    } catch (error) {
      console.error('Error deserializing attestation:', error);
      throw new Error('Failed to deserialize attestation');
    }
  }

  public broadcastBlock(block: Block): void {
    const serializedBlock = this.serializeBlock(block);
    const message: BlockMessage = {
      type: 'block',
      data: serializedBlock
    };

    const connectedPeers = Array.from(this.connections.keys());
    console.log(`Broadcasting block ${block.id} to ${connectedPeers.length} peers`);

    for (const [peerId, conn] of this.connections) {
      try {
        if (conn.open) {
          conn.send(message);
          console.log(`Sent block ${block.id} to ${peerId}`);
        }
      } catch (error) {
        console.error(`Failed to send block to ${peerId}:`, error);
        // Don't remove connection here, let the error handler deal with it
      }
    }
  }

  public broadcastCandidateBlock(block: Block): void {
    const serializedBlock = this.serializeBlock(block);
    const message: CandidateBlockMessage = {
      type: 'CANDIDATE_BLOCK_PROPOSAL',
      data: serializedBlock
    };

    const connectedPeers = Array.from(this.connections.keys());
    console.log(`Broadcasting candidate block ${block.id} to ${connectedPeers.length} peers`);

    for (const [peerId, conn] of this.connections) {
      try {
        if (conn.open) {
          conn.send(message);
          console.log(`Sent candidate block ${block.id} to ${peerId}`);
        }
      } catch (error) {
        console.error(`Failed to send candidate block to ${peerId}:`, error);
        // Don't remove connection here, let the error handler deal with it
      }
    }
  }

  public broadcastAttestation(attestation: Attestation): void {
    const serializedAttestation = this.serializeAttestation(attestation);
    const message: AttestationMessage = {
      type: 'ATTESTATION_BROADCAST',
      data: serializedAttestation
    };

    const connectedPeers = Array.from(this.connections.keys());
    console.log(`Broadcasting attestation for puzzle ${attestation.puzzleId} to ${connectedPeers.length} peers`);

    for (const [peerId, conn] of this.connections) {
      try {
        if (conn.open) {
          conn.send(message);
          console.log(`Sent attestation for puzzle ${attestation.puzzleId} to ${peerId}`);
        }
      } catch (error) {
        console.error(`Failed to send attestation to ${peerId}:`, error);
        // Don't remove connection here, let the error handler deal with it
      }
    }
  }

  public getPeerId(): string | null {
    return this.peer.id || null;
  }

  public getConnectedPeers(): string[] {
    return Array.from(this.connections.keys()).filter(peerId => {
      const conn = this.connections.get(peerId);
      return conn && conn.open;
    });
  }

  public isConnectedToPeer(peerId: string): boolean {
    const conn = this.connections.get(peerId);
    return conn ? conn.open : false;
  }

  public disconnectFromPeer(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.close();
      this.connections.delete(peerId);
      console.log(`Disconnected from peer: ${peerId}`);
    }
  }

  public destroy(): void {
    console.log('Destroying P2P Node...');
    
    // Close all connections
    for (const [peerId, conn] of this.connections) {
      try {
        conn.close();
      } catch (error) {
        console.error(`Error closing connection to ${peerId}:`, error);
      }
    }
    this.connections.clear();

    // Destroy the peer
    if (!this.peer.destroyed) {
      this.peer.destroy();
    }

    this.removeAllListeners();
  }

  public requestChain(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (!conn || !conn.open) {
      console.error(`Cannot request chain from ${peerId}: Not connected`);
      return;
    }

    const message: ChainRequestMessage = {
      type: 'GET_CHAIN_REQUEST',
      data: null
    };

    try {
      conn.send(message);
      console.log(`Sent chain request to ${peerId}`);
    } catch (error) {
      console.error(`Failed to send chain request to ${peerId}:`, error);
    }
  }

  public sendChain(peerId: string, chain: any): void {
    const conn = this.connections.get(peerId);
    if (!conn || !conn.open) {
      console.error(`Cannot send chain to ${peerId}: Not connected`);
      return;
    }

    const message: ChainResponseMessage = {
      type: 'CHAIN_RESPONSE',
      data: chain
    };

    try {
      conn.send(message);
      console.log(`Sent chain response to ${peerId}`);
    } catch (error) {
      console.error(`Failed to send chain response to ${peerId}:`, error);
    }
  }
} 