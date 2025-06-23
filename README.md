# apstat-chain


![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/apstat-chain/ci.yml?branch=main)
![Codecov](https://img.shields.io/codecov/c/github/YOUR_USERNAME/apstat-chain)
![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)

A serverless, peer-to-peer web application for tracking verifiable student progress in AP Statistics.
## Core Philosophy

This project is built on the principle of **practical decentralization**. Instead of relying on a heavy, centralized backend server, each student's device acts as a node in a small, resilient network. The goal is not to create a cryptocurrency, but to empower students with ownership over their learning record and to build a system that is transparent, resilient, and engaging.

The design prioritizes simplicity, educational value, and a frictionless user experience over complex, "ideologically pure" blockchain implementations.

## Key Features

-   **Decentralized Identity:** Users create and manage their own identity via a 12-word mnemonic phrase.
-   **Proof of Knowledge:** Lesson and quiz completions are recorded as cryptographically signed "transactions."
-   **Peer-to-Peer Sync:** Progress is shared and verified directly between peers on the network without a central server.
-   **Eventually-Consistent Leaderboard:** A dynamic leaderboard emerges from the network consensus over time.
-   **Responsive & Modern UI:** A clean, fast interface built with React and Tailwind CSS, designed for both desktop and mobile devices.

## Tech Stack

-   **Monorepo Management:** npm Workspaces
-   **Frontend:** React, Vite, TypeScript, Tailwind CSS
-   **State Management:** React Context API
-   **P2P & Networking:** `peerjs` (WebRTC), DNS Seeding for peer discovery
-   **Cryptography:** `@noble/hashes`, `@noble/secp256k1` for signatures and hashing
-   **Testing:** Vitest, React Testing Library, MSW for mocking
-   **Code Quality:** ESLint and Prettier

## Project Structure

This is a monorepo managed with npm workspaces.

-   `apps/ui`: The main React frontend application that students will interact with.
-   `packages/core`: A pure TypeScript package containing the core logic for cryptography, transaction creation, and data structures.
-   `packages/p2p`: A package responsible for managing peer-to-peer network connections and communication.

## Getting Started

To get the project running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/apstat-chain.git
    cd apstat-chain
    ```

2.  **Install dependencies:**
    This command will install dependencies for all workspaces (`apps` and `packages`).
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This will start the React UI application on `http://localhost:5173`.
    ```bash
    npm run dev
    ```

## Running Tests

This project follows a Test-Driven Development (TDD) approach. All core logic is thoroughly tested.

-   **Run all tests once:**
    ```bash
    npm test
    ```

-   **Run tests in watch mode:**
    This is highly recommended during development. Tests will re-run automatically when you save a file.
    ```bash
    npm run test:watch
    ```

## Architectural Principles

This project is guided by a few key architectural decisions:

1.  **No Automated E2E Testing:** To maintain a fast and reliable development workflow, we rely on comprehensive unit and integration tests instead of slower, flakier E2E tests.
2.  **User-Sovereign Identity:** User identity is self-managed via a mnemonic phrase, empowering the user and avoiding a centralized user database.
3.  **Pure P2P Network (No Server):** The application is a purely static frontend that requires no custom backend server, maximizing resilience and simplifying deployment. Peer discovery is handled via DNS seeding.


## License

This project is released into the public domain. See the [LICENSE](LICENSE) file for details.

