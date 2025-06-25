# 007. Core Application Features

- **Status:** Accepted
- **Date:** 6/24/25

## Context

The MVP (Minimum Viable Product) needs to demonstrate the core functionality of the APStat Chain application. Users need a way to interact with the blockchain to create "Proof of Knowledge" transactions, view the transparent audit trail of all learning activities, and see ranked progress across the network. These features form the foundation of the educational blockchain system where students can prove their learning progress in a decentralized, transparent manner.

The application must provide clear user interactions that translate learning activities into blockchain transactions, while also providing visibility into the global state of the educational network through data visualization and ranking systems.

## Decision

We will implement three core application features that collectively demonstrate the MVP functionality:

### 1. Complete Lesson Button - Primary Transaction Creation Interface

- **Primary User Interaction:** A "Complete Lesson" button will serve as the main mechanism for users to create "Proof of Knowledge" transactions
- **Transaction Generation:** When clicked, this button will:
  - Gather lesson completion data (lesson ID, completion timestamp, user identity)
  - Create a cryptographically signed transaction using the user's wallet
  - Broadcast the transaction to the P2P network
  - Provide user feedback on transaction status (pending, confirmed, failed)
- **User Experience:** The button will be prominently displayed in the learning interface and provide clear visual feedback during the transaction process

### 2. Global Ledger Component - Transparent Audit Trail

- **Network Transaction Display:** A "Global Ledger" component will display all valid transactions received from the P2P network
- **Real-time Updates:** The ledger will automatically update as new transactions are discovered and validated through the P2P network
- **Transaction Details:** Each entry will show:
  - Transaction hash and timestamp
  - User identity (public key or derived identifier)
  - Lesson/course information
  - Transaction validation status
- **Audit Trail Function:** This serves as a transparent, immutable record of all learning activities across the network

### 3. Leaderboard Component - Ranked Progress Visualization

- **Data Processing:** A "Leaderboard" component will process raw transaction data from the Global Ledger
- **Progress Computation:** The component will:
  - Aggregate completion data by user identity
  - Calculate progress metrics (lessons completed, courses finished, activity frequency)
  - Rank users based on their learning achievements
- **Dynamic Ranking:** Rankings will update in real-time as new transactions are processed
- **Privacy-Aware Display:** User identities will be displayed using derived identifiers to maintain privacy while enabling competition

## Consequences

**Positive:**
- **Clear User Journey:** The Complete Lesson button provides an intuitive way for users to interact with the blockchain
- **Transparency:** The Global Ledger demonstrates the decentralized, transparent nature of the educational records
- **Gamification:** The Leaderboard introduces competitive elements that can motivate continued learning
- **Real-time Feedback:** All components provide immediate feedback on user actions and network state
- **MVP Validation:** These features collectively demonstrate all core aspects of the educational blockchain concept

**Trade-offs:**
- **Network Dependency:** All features require active P2P connections to function properly
- **Performance Considerations:** Real-time updates and data processing may impact application performance with large datasets
- **Privacy vs. Transparency:** Balancing user privacy with the transparency goals of the ledger system
- **Data Persistence:** Components rely on P2P network data; offline functionality will be limited

**Implementation Requirements:**
- Integration with existing `BlockchainService` for transaction creation and signing
- Real-time P2P network event handling for ledger updates
- Efficient data structures for processing and ranking large transaction datasets
- Responsive UI components that handle loading states and network errors gracefully
- Clear error handling and user feedback mechanisms for network connectivity issues

**Future Considerations:**
- Pagination or virtualization for large ledger datasets
- Advanced filtering and search capabilities for the ledger
- Additional ranking metrics and achievement systems for the leaderboard
- Export functionality for personal learning records
- Integration with external educational platforms and content management systems 