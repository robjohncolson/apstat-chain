import type { Transaction } from '@apstat-chain/core';
import { peerIdFromPublicKey, type KeyPair } from '@apstat-chain/core';
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

  constructor(keyPair: KeyPair) {
    super();
    const derivedId = peerIdFromPublicKey(keyPair.publicKey);
    this.peer = new Peer(derivedId);
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
          case 'peer-list':
    this.handlePeerList(message as PeerListMessage);
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
} 