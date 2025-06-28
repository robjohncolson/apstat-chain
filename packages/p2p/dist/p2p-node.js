import { peerIdFromPublicKey } from '@apstat-chain/core';
import { EventEmitter } from 'eventemitter3';
import { Peer } from 'peerjs';
export class P2PNode extends EventEmitter {
    handlePeerList(message) {
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
    peer;
    connections = new Map();
    mempoolGetter = null;
    constructor(keyPair, config) {
        super();
        const derivedId = peerIdFromPublicKey(keyPair.publicKey);
        // Use config if provided, otherwise use environment variables or defaults
        const peerConfig = {};
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
    setMempoolGetter(getter) {
        this.mempoolGetter = getter;
    }
    setupPeerEventHandlers() {
        this.peer.on('open', (id) => {
            console.log(`P2P Node initialized with ID: ${id}`);
            this.emit('ready', id);
        });
        this.peer.on('connection', (conn) => {
            console.log(`Incoming connection from: ${conn.peer}`);
            this.setupConnectionEventHandlers(conn);
        });
        this.peer.on('error', (error) => {
            console.error('P2P Error:', error);
            this.emit('error', error);
        });
    }
    setupConnectionEventHandlers(conn) {
        conn.on('open', () => {
            console.log(`Connection opened with: ${conn.peer}`);
            this.connections.set(conn.peer, conn);
            this.emit('peer:connected', conn.peer);
            // WELCOME WAGON: Send your known peers to the new connection.
            const peerListMessage = {
                type: 'peer-list',
                data: this.getConnectedPeers()
            };
            console.log(`[P2P SEND] Sending peer list to ${conn.peer}:`, peerListMessage.data);
            conn.send(peerListMessage);
            // WELCOME WAGON: Send your current mempool to the new connection.
            if (this.mempoolGetter) {
                const currentMempool = this.mempoolGetter();
                const serializedTransactions = currentMempool.map(tx => this.serializeTransaction(tx));
                const mempoolMessage = {
                    type: 'MEMPOOL_RESPONSE',
                    data: serializedTransactions
                };
                console.log(`[P2P SEND] Sending mempool with ${currentMempool.length} transactions to ${conn.peer}`);
                conn.send(mempoolMessage);
            }
        });
        conn.on('data', (data) => {
            this.handleIncomingData(data, conn.peer);
        });
        conn.on('close', () => {
            console.log(`Connection closed with: ${conn.peer}`);
            this.connections.delete(conn.peer);
            this.emit('peer:disconnected', conn.peer);
        });
        conn.on('error', (error) => {
            console.error(`Connection error with ${conn.peer}:`, error);
            this.connections.delete(conn.peer);
            this.emit('connection:error', { peer: conn.peer, error });
        });
    }
    handleIncomingData(data, fromPeer) {
        console.log(`[P2P RECV] Received data from ${fromPeer}:`, data);
        try {
            // Validate message structure
            if (!data || typeof data !== 'object' || !data.type) {
                console.warn('Received malformed message from', fromPeer);
                return;
            }
            const message = data;
            switch (message.type) {
                case 'transaction':
                    this.handleTransaction(message, fromPeer);
                    break;
                case 'block':
                    this.handleBlock(message, fromPeer);
                    break;
                case 'peer-list':
                    this.handlePeerList(message);
                    break;
                case 'GET_CHAIN_REQUEST':
                    this.handleChainRequest(message, fromPeer);
                    break;
                case 'CHAIN_RESPONSE':
                    this.handleChainResponse(message, fromPeer);
                    break;
                case 'CANDIDATE_BLOCK_PROPOSAL':
                    this.handleCandidateBlock(message, fromPeer);
                    break;
                case 'ATTESTATION_BROADCAST':
                    this.handleAttestation(message, fromPeer);
                    break;
                case 'MEMPOOL_RESPONSE':
                    this.handleMempoolResponse(message, fromPeer);
                    break;
                default:
                    console.log(`Received unknown message type: ${message.type} from ${fromPeer}`);
                    this.emit('message:received', { type: message.type, data: message.data, fromPeer });
            }
        }
        catch (error) {
            console.error('Error handling incoming data:', error);
        }
    }
    handleTransaction(message, fromPeer) {
        console.log(`Received transaction ${message.data.id} from ${fromPeer}`);
        const transaction = this.deserializeTransaction(message.data);
        this.emit('transaction:received', transaction);
    }
    handleBlock(message, fromPeer) {
        console.log(`Received block ${message.data.id} from ${fromPeer}`);
        const block = this.deserializeBlock(message.data);
        this.emit('block:received', block, fromPeer);
    }
    handleChainRequest(_message, fromPeer) {
        console.log(`Received chain request from ${fromPeer}`);
        this.emit('chain-request:received', fromPeer);
    }
    handleChainResponse(message, fromPeer) {
        console.log(`Received chain response from ${fromPeer}`);
        this.emit('chain:received', message.data);
    }
    handleCandidateBlock(message, fromPeer) {
        console.log(`Received candidate block ${message.data.id} from ${fromPeer}`);
        const block = this.deserializeBlock(message.data);
        this.emit('candidate-block:received', block);
    }
    handleAttestation(message, fromPeer) {
        console.log(`Received attestation for puzzle ${message.data.puzzleId} from ${fromPeer}`);
        const attestation = this.deserializeAttestation(message.data);
        this.emit('attestation:received', attestation);
    }
    handleMempoolResponse(message, fromPeer) {
        console.log(`Received mempool response from ${fromPeer}`);
        this.emit('mempool:received', message.data);
    }
    connectToPeer(peerId) {
        if (this.connections.has(peerId)) {
            console.log(`Already connected to peer: ${peerId}`);
            return;
        }
        console.log(`Connecting to peer: ${peerId}`);
        const conn = this.peer.connect(peerId);
        this.setupConnectionEventHandlers(conn);
    }
    // Helper function to serialize transactions for network transmission
    serializeTransaction(transaction) {
        try {
            // Handle both old and new transaction structures
            const txCopy = { ...transaction };
            // If signature is an object with bigint values (old structure), convert to string
            if (typeof txCopy.signature === 'object' && txCopy.signature !== null && 'r' in txCopy.signature) {
                txCopy.signature = {
                    r: txCopy.signature.r.toString(),
                    s: txCopy.signature.s.toString(),
                    recovery: txCopy.signature.recovery
                };
            }
            return txCopy;
        }
        catch (error) {
            console.error('Error serializing transaction:', error);
            throw new Error('Failed to serialize transaction');
        }
    }
    // Helper function to deserialize transactions from network transmission
    deserializeTransaction(data) {
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
        }
        catch (error) {
            console.error('Error deserializing transaction:', error);
            throw new Error('Failed to deserialize transaction');
        }
    }
    broadcastTransaction(transaction) {
        const serializedTransaction = this.serializeTransaction(transaction);
        const message = {
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
            }
            catch (error) {
                console.error(`Failed to send transaction to ${peerId}:`, error);
                // Don't remove connection here, let the error handler deal with it
            }
        }
    }
    // Helper function to serialize blocks for network transmission
    serializeBlock(block) {
        try {
            // Block structure is simple, just copy it
            const blockCopy = { ...block };
            return blockCopy;
        }
        catch (error) {
            console.error('Error serializing block:', error);
            throw new Error('Failed to serialize block');
        }
    }
    // Helper function to serialize attestations for network transmission
    serializeAttestation(attestation) {
        try {
            // Attestation structure is simple, just copy it
            const attestationCopy = { ...attestation };
            return attestationCopy;
        }
        catch (error) {
            console.error('Error serializing attestation:', error);
            throw new Error('Failed to serialize attestation');
        }
    }
    // Helper function to deserialize blocks from network transmission
    deserializeBlock(data) {
        try {
            let block = data;
            // Parse string data if needed
            if (typeof data === 'string') {
                block = JSON.parse(data);
            }
            return block;
        }
        catch (error) {
            console.error('Error deserializing block:', error);
            throw new Error('Failed to deserialize block');
        }
    }
    // Helper function to deserialize attestations from network transmission
    deserializeAttestation(data) {
        try {
            let attestation = data;
            // Parse string data if needed
            if (typeof data === 'string') {
                attestation = JSON.parse(data);
            }
            return attestation;
        }
        catch (error) {
            console.error('Error deserializing attestation:', error);
            throw new Error('Failed to deserialize attestation');
        }
    }
    broadcastBlock(block) {
        const serializedBlock = this.serializeBlock(block);
        const message = {
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
            }
            catch (error) {
                console.error(`Failed to send block to ${peerId}:`, error);
                // Don't remove connection here, let the error handler deal with it
            }
        }
    }
    broadcastCandidateBlock(block) {
        const serializedBlock = this.serializeBlock(block);
        const message = {
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
            }
            catch (error) {
                console.error(`Failed to send candidate block to ${peerId}:`, error);
                // Don't remove connection here, let the error handler deal with it
            }
        }
    }
    broadcastAttestation(attestation) {
        const serializedAttestation = this.serializeAttestation(attestation);
        const message = {
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
            }
            catch (error) {
                console.error(`Failed to send attestation to ${peerId}:`, error);
                // Don't remove connection here, let the error handler deal with it
            }
        }
    }
    getPeerId() {
        return this.peer.id || null;
    }
    getConnectedPeers() {
        return Array.from(this.connections.keys()).filter(peerId => {
            const conn = this.connections.get(peerId);
            return conn && conn.open;
        });
    }
    isConnectedToPeer(peerId) {
        const conn = this.connections.get(peerId);
        return conn ? conn.open : false;
    }
    disconnectFromPeer(peerId) {
        const conn = this.connections.get(peerId);
        if (conn) {
            conn.close();
            this.connections.delete(peerId);
            console.log(`Disconnected from peer: ${peerId}`);
        }
    }
    destroy() {
        console.log('Destroying P2P Node...');
        // Close all connections
        for (const [peerId, conn] of this.connections) {
            try {
                conn.close();
            }
            catch (error) {
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
    requestChain(peerId) {
        const conn = this.connections.get(peerId);
        if (!conn || !conn.open) {
            console.error(`Cannot request chain from ${peerId}: Not connected`);
            return;
        }
        const message = {
            type: 'GET_CHAIN_REQUEST',
            data: null
        };
        try {
            conn.send(message);
            console.log(`Sent chain request to ${peerId}`);
        }
        catch (error) {
            console.error(`Failed to send chain request to ${peerId}:`, error);
        }
    }
    sendChain(peerId, chain) {
        const conn = this.connections.get(peerId);
        if (!conn || !conn.open) {
            console.error(`Cannot send chain to ${peerId}: Not connected`);
            return;
        }
        const message = {
            type: 'CHAIN_RESPONSE',
            data: chain
        };
        try {
            conn.send(message);
            console.log(`Sent chain response to ${peerId}`);
        }
        catch (error) {
            console.error(`Failed to send chain response to ${peerId}:`, error);
        }
    }
}
//# sourceMappingURL=p2p-node.js.map