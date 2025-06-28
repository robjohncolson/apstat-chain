import type { Transaction, Attestation } from '@apstat-chain/core';
import { type KeyPair, type Block } from '@apstat-chain/core';
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
export interface BlockMessage extends P2PMessage {
    type: 'block';
    data: Block;
}
export interface ChainRequestMessage extends P2PMessage {
    type: 'GET_CHAIN_REQUEST';
    data: null;
}
export interface ChainResponseMessage extends P2PMessage {
    type: 'CHAIN_RESPONSE';
    data: any;
}
export interface CandidateBlockMessage extends P2PMessage {
    type: 'CANDIDATE_BLOCK_PROPOSAL';
    data: Block;
}
export interface AttestationMessage extends P2PMessage {
    type: 'ATTESTATION_BROADCAST';
    data: Attestation;
}
export interface MempoolRequestMessage extends P2PMessage {
    type: 'MEMPOOL_REQUEST';
    data: null;
}
export interface MempoolResponseMessage extends P2PMessage {
    type: 'MEMPOOL_RESPONSE';
    data: Transaction[];
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
    private handleBlock;
    private handleChainRequest;
    private handleChainResponse;
    private handleCandidateBlock;
    private handleAttestation;
    private handleMempoolRequest;
    private handleMempoolResponse;
    connectToPeer(peerId: string): void;
    private serializeTransaction;
    private deserializeTransaction;
    broadcastTransaction(transaction: Transaction): void;
    private serializeBlock;
    private serializeAttestation;
    private deserializeBlock;
    private deserializeAttestation;
    broadcastBlock(block: Block): void;
    broadcastCandidateBlock(block: Block): void;
    broadcastAttestation(attestation: Attestation): void;
    getPeerId(): string | null;
    getConnectedPeers(): string[];
    isConnectedToPeer(peerId: string): boolean;
    disconnectFromPeer(peerId: string): void;
    destroy(): void;
    requestChain(peerId: string): void;
    sendChain(peerId: string, chain: any): void;
    requestMempool(peerId: string): void;
    sendMempool(peerId: string, transactions: Transaction[]): void;
}
//# sourceMappingURL=p2p-node.d.ts.map