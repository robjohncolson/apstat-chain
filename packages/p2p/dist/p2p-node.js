import { EventEmitter } from 'events';
import { Peer } from 'peerjs';
export class P2PNode extends EventEmitter {
    peer;
    connections = new Map();
    constructor(peerId) {
        super();
        this.peer = peerId ? new Peer(peerId) : new Peer();
        this.setupPeerEventHandlers();
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
        this.emit('transaction:received', message.data);
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
    broadcastTransaction(transaction) {
        const message = {
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
            }
            catch (error) {
                console.error(`Failed to send transaction to ${peerId}:`, error);
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
}
//# sourceMappingURL=p2p-node.js.map