# 003. P2P Networking Layer

- **Status:** Accepted
- **Date:** 6/23/25

## Context

The decentralized genesis architecture requires a robust peer-to-peer networking solution that operates without any central server infrastructure. The system needs to enable real-time communication between peers while maintaining the serverless architecture principles. Traditional P2P solutions often rely on centralized signaling servers or complex NAT traversal mechanisms, which would contradict our goal of eliminating single points of failure. We need a solution that balances simplicity, reliability, and true decentralization.

## Decision

We will implement a serverless P2P architecture using the following technologies and approaches:

1. **WebRTC Communication:** We will use `peerjs` as our WebRTC abstraction layer. PeerJS provides:
   - Simplified WebRTC API that handles complex peer connection setup
   - Built-in handling of ICE candidates and STUN/TURN server coordination
   - Reliable data channel management for real-time communication
   - Browser compatibility across modern web platforms

2. **DNS-based Peer Discovery:** Peer discovery will be handled exclusively through DNS-over-HTTPS (DoH) lookups to a designated seed domain. This approach:
   - Uses DNS TXT records to store and distribute peer information
   - Leverages existing DNS infrastructure without requiring custom servers
   - Provides natural load balancing and geographic distribution through DNS
   - Maintains high availability through DNS redundancy and caching

3. **Serverless Architecture:** The entire networking layer will operate without any active backend servers:
   - No signaling servers required for peer discovery
   - No central coordination points for network topology
   - Static hosting compatibility maintained throughout the networking stack

## Consequences

**Positive:**
- The application maintains true serverless operation while enabling P2P functionality
- DNS-based discovery leverages existing, highly reliable infrastructure
- PeerJS abstracts away WebRTC complexity while maintaining full control over connections
- No ongoing server maintenance or hosting costs for networking infrastructure
- Natural resistance to censorship and single points of failure
- Geographic distribution and load balancing provided by DNS infrastructure

**Trade-offs:**
- Initial peer discovery depends on DNS infrastructure availability
- WebRTC connections may require STUN/TURN servers for some network configurations (though this is standard for any WebRTC implementation)
- DNS propagation delays may affect rapid network topology changes
- Limited control over DNS caching behavior across different resolvers

**Becomes Easier:**
- Deploying the application to any static hosting provider
- Scaling peer discovery without infrastructure management
- Maintaining high availability through distributed DNS infrastructure
- Implementing real-time peer-to-peer communication features

**Becomes Harder:**
- Debugging network connectivity issues across diverse NAT configurations
- Implementing advanced network topology optimization
- Managing DNS record updates for peer information (though this can be automated)
- Handling edge cases where DNS-over-HTTPS is blocked or unavailable 