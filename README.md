# APStat Chain

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/apstat-chain/ci.yml?branch=main)
![Codecov](https://img.shields.io/codecov/c/github/YOUR_USERNAME/apstat-chain)
![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)

🎓 **A revolutionary decentralized educational platform that transforms AP Statistics learning into an engaging, blockchain-powered collaborative experience.**

## 🌟 What Makes APStat Chain Special

APStat Chain reimagines educational technology by eliminating centralized infrastructure and putting students in control of their learning data. Through innovative "social consensus" mechanisms, students validate each other's work while building an immutable record of their academic achievements.

### 🎯 Core Philosophy

- **Student Sovereignty**: Students own and control their learning data through cryptographic identity
- **Peer Collaboration**: Academic integrity through peer validation rather than centralized answer keys  
- **Zero Infrastructure**: Completely serverless architecture with no backend dependencies
- **Transparent Progress**: Immutable, auditable record of all learning activities
- **Gamified Learning**: Mission Control dashboard with competitive elements and achievement rewards

## 🚀 Key Features

### 🔗 Blockchain Learning Records
- **Proof of Knowledge Transactions**: Academic achievements cryptographically signed and permanently recorded
- **Immutable Ledger**: Tamper-evident history of all learning activities across the network
- **Self-Sovereign Identity**: 12-word mnemonic phrases for student-controlled account management
- **Chain Validation**: Complete blockchain with genesis block and cryptographic integrity verification

### 🤝 Social Consensus Innovation
- **Peer Mining**: Students propose blocks by solving AP Statistics puzzles
- **Attestation System**: Network validates proposed answers through peer review
- **Dynamic Quorum**: Attestation requirements automatically adjust (30% of peers, min 3, max 7)
- **Academic Integrity**: Consensus mechanism ensures answer accuracy without centralized control

### 🌐 Pure P2P Networking
- **WebRTC Communication**: Real-time peer-to-peer data sharing using PeerJS
- **DNS-Based Discovery**: Serverless peer discovery through DNS TXT records
- **Mesh Network Formation**: Automatic peer introduction and network topology optimization
- **State Synchronization**: Real-time mempool and blockchain sync across all nodes

### 🎮 Gamified Mission Control Interface
- **Space-Themed Dashboard**: Mission Control center with status indicators and progress tracking
- **Olympic-Style Leaderboard**: Podium visualization with gold/silver/bronze medals and rankings
- **Priority Transaction Rewards**: Successful miners get priority processing for their next submission
- **Achievement Celebration**: Visual rewards and progress indicators for learning milestones

### 📱 Modern User Experience
- **Tabbed Information Architecture**: 
  - **Network Activity**: Mining, attestation, and mempool management
  - **My Progress**: Personal learning journey and achievement tracking
  - **Leaderboard**: Community rankings and competitive metrics
- **Responsive Design**: Mobile-optimized interface for all screen sizes
- **Dark/Light Themes**: Complete theme support with automatic system detection
- **Real-time Updates**: Live network status and progress indicators

## 🏗️ Technical Architecture

### Monorepo Structure
```
apstat-chain/
├── apps/
│   └── ui/                 # React frontend application
├── packages/
│   ├── core/              # Blockchain logic & cryptography
│   ├── p2p/               # P2P networking layer
│   └── data/              # AP Statistics curriculum data
└── docs/adr/              # Architectural Decision Records
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Blockchain**: Custom implementation with Noble cryptography
- **P2P Networking**: PeerJS (WebRTC), DNS-over-HTTPS discovery
- **State Management**: React Context API with service layer
- **Testing**: Vitest, React Testing Library, 95%+ coverage
- **Deployment**: Vercel with monorepo optimization
- **Package Management**: pnpm with workspace dependencies

### Cryptographic Security
- **Identity**: BIP39 mnemonic phrases with ECDSA keypairs
- **Transactions**: Cryptographically signed with tamper detection
- **Blocks**: SHA-256 hashing with previous block linking
- **Validation**: Complete signature verification and chain integrity checks

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- pnpm package manager

### Installation & Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/apstat-chain.git
   cd apstat-chain
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```
   
   The application will be available at `http://localhost:5173`

4. **Run tests**
   ```bash
   # Run all tests once
   pnpm test
   
   # Watch mode (recommended for development)
   pnpm test:watch
   ```

### Production Deployment

The application is optimized for deployment on static hosting platforms:

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

**Vercel Deployment**: The project includes optimized Vercel configuration and deploys automatically from the main branch.

## 🎓 Educational Benefits

### For Students
- **Ownership Psychology**: Students develop attachment to their permanent learning record
- **Cryptography Education**: Hands-on experience with blockchain and cryptographic concepts
- **Peer Collaboration**: Social consensus encourages discussion and critical thinking
- **Gamified Motivation**: Competitive elements and achievement systems drive engagement
- **Transparency**: Complete visibility into progress and network participation

### For Teachers
- **Zero Infrastructure**: No IT setup, maintenance, or ongoing costs required
- **Optional Visibility**: Students can share progress for classroom management
- **Social Recovery**: Teacher-assisted account recovery for lost mnemonic phrases
- **Academic Integrity**: Peer validation ensures answer accuracy
- **Real-time Insights**: Live view of class participation and progress

### For Institutions
- **Cost Effective**: No server infrastructure or ongoing hosting costs
- **Privacy Compliant**: Student data remains under student control
- **Resilient**: Network continues functioning with minimal participation
- **Scalable**: Automatically adapts to any class size
- **Future-Proof**: Decentralized architecture eliminates vendor lock-in

## 🔬 Advanced Features

### Blockchain & Consensus
- **Genesis Block**: Hardcoded starting point for the chain
- **Block Mining**: Students solve puzzles to propose new blocks
- **Social Validation**: Peer attestation replaces centralized answer verification
- **Conflict Resolution**: "Longest chain wins" with automatic synchronization
- **Priority Transactions**: Reward system for successful miners

### Network Protocols
- **Peer Discovery**: DNS-based bootstrapping with automatic mesh formation
- **Block Broadcasting**: Efficient propagation of new blocks
- **Chain Synchronization**: Full chain sharing for conflict resolution
- **Mempool Sync**: "Welcome wagon" protocol for new peer onboarding
- **Connection Management**: Automatic reconnection and peer list maintenance

### Developer Experience
- **Service/Provider Pattern**: Clean separation between blockchain and UI logic
- **Comprehensive Testing**: Unit tests for all critical functionality
- **TypeScript**: Complete type safety across all packages
- **Documentation**: 21 Architectural Decision Records (ADRs) documenting all decisions
- **Code Quality**: ESLint, Prettier, and strict TypeScript configuration

## 📚 Documentation

### Architecture Decision Records (ADRs)
Complete documentation of all architectural decisions in `/docs/adr/`:

- **000-020**: Full decision history from initial architecture to V1.0 release
- **Key ADRs**: Decentralized genesis (001), cryptography (002), P2P networking (003), social consensus (012), UI redesign (019)

### Development Guidelines
- **Testing Strategy**: Unit tests with React Testing Library, manual E2E validation
- **Code Organization**: Monorepo with clear package separation
- **State Management**: Service layer with React Context providers
- **Deployment**: Vercel with optimized monorepo configuration

## 🤝 Contributing

APStat Chain is released into the public domain and welcomes contributions:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow existing patterns** (see ADRs for architectural guidelines)
4. **Add tests** for new functionality
5. **Submit a pull request**

### Development Principles
- **Test-Driven Development**: Write tests first, then implementation
- **Documentation**: Update ADRs for architectural decisions
- **Type Safety**: Maintain strict TypeScript throughout
- **User Focus**: Prioritize educational value and user experience

## 🎯 Roadmap & Future Vision

### V1.0 Foundation ✅
- Complete decentralized architecture
- Social consensus mechanism
- Gamified user interface
- Production deployment

### Future Enhancements
- **Enhanced Analytics**: Detailed learning analytics and progress insights
- **Curriculum Integration**: Expanded AP Statistics content and assessments
- **Teacher Tools**: Enhanced classroom management and oversight features
- **Mobile Apps**: Native iOS/Android applications
- **Multi-Subject**: Expansion to other AP courses and educational content

## 📄 License

This project is released into the **public domain** under the Unlicense. See the [LICENSE](LICENSE) file for details.

Use it, modify it, learn from it, and build upon it freely. Education should be open.

## 🙏 Acknowledgments

- **Noble Cryptography**: Providing secure, audited cryptographic primitives
- **PeerJS Community**: Enabling accessible WebRTC peer-to-peer networking
- **React Team**: For the excellent developer experience and ecosystem
- **Vercel**: For seamless deployment and hosting infrastructure
- **AP Statistics Educators**: For inspiration and educational context

## 🆘 Support

- **Documentation**: Check `/docs/adr/` for architectural details
- **Issues**: Open GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and community interaction
- **Email**: Contact maintainers for urgent issues or collaboration

---

**APStat Chain V1.0** - Transforming education through decentralization, one block at a time. 🎓⛓️
