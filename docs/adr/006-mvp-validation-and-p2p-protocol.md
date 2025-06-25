# ADR-006: MVP Validation and P2P Protocol

Date: 2024-12-18

## Status

Accepted

## Context

After assembling the application components as per ADR-005, initial end-to-end testing revealed that while peers could connect to a known bootstrap node, they were not discovering each other, preventing a true mesh network from forming. Furthermore, debugging was complicated by unexpected multi-instance behavior.

The initial P2P implementation successfully established connections between nodes and a bootstrap peer, but the network remained star-topology rather than evolving into the desired mesh network. This limited the network's resilience and scalability potential.

Additionally, during development and testing phases, we observed unpredictable network behavior that made it difficult to validate the true performance and connectivity patterns of our P2P implementation. Investigation revealed this was related to React's development environment behavior.

## Decision 1: Peer Introduction Protocol

We implemented a simple "peer-list" introduction protocol to enable automatic peer discovery and mesh network formation. When a new connection is established, the nodes now exchange lists of their already-known peers. The receiving node then attempts to connect to any new peers it discovers from that list.

This approach provides:
- **Automatic peer discovery**: Nodes learn about other peers transitively through existing connections
- **Network resilience**: Multiple connection paths reduce single points of failure
- **Scalable growth**: New nodes can quickly integrate into the existing network topology
- **Simple implementation**: Minimal protocol overhead while achieving mesh connectivity

## Decision 2: `StrictMode` Diagnosis

We identified that React's `StrictMode` was causing components to mount twice in the development environment, which in turn created duplicate `P2PNode` instances and made network behavior unpredictable. The solution is to temporarily disable `StrictMode` during P2P-heavy development and testing to observe the application's true single-mount behavior.

This diagnosis revealed:
- **Root cause**: React's intentional double-mounting for detecting side effects
- **Impact**: Multiple P2P node instances creating conflicting network state
- **Solution**: Conditional `StrictMode` disabling during network development
- **Future consideration**: Ensure P2P components are idempotent for production `StrictMode` compatibility

## Consequences

### Positive

- **Mesh network formation**: The application now successfully forms a fully connected mesh network between all peers, achieving the desired network topology
- **Validated testing process**: The manual, multi-browser testing process is confirmed as an effective method for end-to-end validation of P2P functionality
- **Clear development strategy**: We have established a clear approach for handling React development environment quirks that could interfere with P2P networking
- **Improved network resilience**: Multiple peer connections provide redundancy and fault tolerance
- **Scalable peer discovery**: New nodes can join the network and discover peers automatically

### Negative

- **Development environment complexity**: Need to manage `StrictMode` configuration during different development phases
- **Additional protocol overhead**: Peer list exchange adds some network communication overhead
- **Testing complexity**: Multi-browser testing requires more setup and coordination than single-instance testing

### Neutral

- **Protocol simplicity**: The peer introduction protocol is intentionally simple, which may need enhancement as the network scales
- **Manual testing requirement**: End-to-end validation still requires manual coordination across multiple browser instances

## Future Considerations

1. **Enhanced peer discovery**: Consider implementing more sophisticated peer discovery mechanisms as the network scales
2. **StrictMode compatibility**: Ensure all P2P components are designed to be idempotent and compatible with React's StrictMode for production deployments
3. **Automated testing**: Develop automated testing strategies that can simulate multi-peer scenarios without requiring manual browser coordination
4. **Network topology optimization**: Monitor and potentially implement algorithms to optimize network topology as peer count increases 