import type { Transaction } from '@apstat-chain/core';
import { type KeyPair } from '@apstat-chain/core';
import { EventEmitter } from 'eventemitter3';
export interface P2PMessage {
    type: string;
    data: any;
}
export interface PeerListMessage extends P2PMessage {
    type: 'peer-list';
    data: string[];
}
export interface TransactionMessage extends P2PMessage {
    type: 'transaction';
    data: Transaction;
}
export interface P2PNodeConfig {
    host?: string;
    port?: number;
    path?: string;
}
export declare class P2PNode extends EventEmitter {
    private handlePeerList;
    private peer;
    private connections;
    constructor(keyPair: KeyPair, config?: P2PNodeConfig);
    private setupPeerEventHandlers;
    private setupConnectionEventHandlers;
    private handleIncomingData;
    private handleTransaction;
    connectToPeer(peerId: string): void;
    private serializeTransaction;
    private deserializeTransaction;
    broadcastTransaction(transaction: Transaction): void;
    getPeerId(): string | null;
    getConnectedPeers(): string[];
    isConnectedToPeer(peerId: string): boolean;
    disconnectFromPeer(peerId: string): void;
    destroy(): void;
}
//# sourceMappingURL=p2p-node.d.ts.map