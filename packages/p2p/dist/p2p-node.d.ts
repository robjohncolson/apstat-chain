import type { Transaction } from '@apstat-chain/core';
import { EventEmitter } from 'eventemitter3';
export interface P2PMessage {
    type: string;
    data: any;
}
export interface TransactionMessage extends P2PMessage {
    type: 'transaction';
    data: Transaction;
}
export declare class P2PNode extends EventEmitter {
    private peer;
    private connections;
    constructor(peerId?: string);
    private setupPeerEventHandlers;
    private setupConnectionEventHandlers;
    private handleIncomingData;
    private handleTransaction;
    connectToPeer(peerId: string): void;
    broadcastTransaction(transaction: Transaction): void;
    getPeerId(): string | null;
    getConnectedPeers(): string[];
    isConnectedToPeer(peerId: string): boolean;
    disconnectFromPeer(peerId: string): void;
    destroy(): void;
}
//# sourceMappingURL=p2p-node.d.ts.map