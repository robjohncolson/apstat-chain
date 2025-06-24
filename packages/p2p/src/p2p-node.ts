import type { Transaction } from '@apstat-chain/core';
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
    console.log('Received peer list:', remotePeers);
    for (const peerId of remotePeers) {
      if (peerId !== this.getPeerId() && !this.isConnectedToPeer(peerId)) {
        this.connectToPeer(peerId);
      }
    }
  }
  private peer: Peer;
  private connections: Map<string, DataConnection> = new Map();

  constructor(peerId?: string) {
    super();
    this.peer = peerId ? new Peer(peerId) : new Peer();
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
    conn.on('open', () => {
      console.log(`Connection opened with: ${conn.peer}`);
      this.connections.set(conn.peer, conn);
      this.emit('peer:connected', conn.peer);
    });
    conn.on('open', () => {
      console.log(`Connection opened with: ${conn.peer}`);
      this.connections.set(conn.peer, conn);
      this.emit('peer:connected', conn.peer);
    
      // INTRODUCE YOURSELF: Send your known peers to the new connection.
      const peerListMessage: PeerListMessage = {
        type: 'peer-list',
        data: this.getConnectedPeers()
      };
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
    this.emit('transaction:received', message.data);
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

  public broadcastTransaction(transaction: Transaction): void {
    const message: TransactionMessage = {
      type: 'transaction',
      data: transaction
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