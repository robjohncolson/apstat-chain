ADR-023: Strategic Merger of V1 Utility into V2 Architecture
Status: Accepted
Date: 2025-07-01
Context:
The v2 architecture (APStat Chain) successfully established a robust, decentralized, and modern technical foundation. However, initial user-facing features were less comprehensive than a preceding, non-TDD prototype (index.html). The prototype, while technically simple, contains a rich set of battle-tested features, a mature data structure (allUnitsData.js), and a proven information architecture that delivers high user value. A decision is needed on how to efficiently bridge the gap between the powerful v2 architecture and the desired user experience.
Decision:
We will not start over. Instead, we will execute a strategic merger. We will systematically port the features, data structures, and information architecture from the v1 prototype into the v2 React/shadcn/ui application. The core principle is to use the v1 prototype as a definitive blueprint for the user experience, while implementing it using the superior services, components, and blockchain backend of the v2 architecture. This leverages the best of both systems: the proven utility of v1 and the technical excellence of v2.
Consequences:
Becomes Easier: Delivering tangible user value quickly. The roadmap for UI development becomes crystal clear—rebuild the tabs and features from index.html.
Becomes Harder: This requires a temporary pause on developing new visionary features to focus on porting existing, proven ones.
Positive: The final product will have a high-quality, modern UI (shadcn), a powerful decentralized backend (P2P/blockchain), and a rich, useful feature set that we know students need. The project's ambition will finally match its user-facing reality.
Trade-off: We are accepting that the fastest path to a great product is to learn from and replicate our past success within our new, more capable framework.