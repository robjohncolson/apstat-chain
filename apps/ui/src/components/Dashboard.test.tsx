import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { BlockchainProvider } from '../providers/BlockchainProvider';

describe('Dashboard', () => {
  it('should render wallet and network data correctly', () => {
    // 1. Define mock service
    const mockService = {
      getPendingContributionTotal: vi.fn().mockReturnValue(0.5),
      isEligibleToMine: vi.fn().mockReturnValue(false),
      getCandidateBlocks: vi.fn().mockReturnValue([]),
      getPendingTransactions: vi.fn().mockReturnValue([]),
      submitAttestation: vi.fn(),
      getMiningPuzzle: vi.fn(),
      proposeBlock: vi.fn(),
    };

    // 2. Define mock data
    const mockData = {
      publicKey: { hex: '02_FAKE_PUBLIC_KEY', bytes: new Uint8Array() },
      peerId: 'FAKE_PEER_ID',
      connectedPeers: ['PEER_1', 'PEER_2', 'PEER_3'],
      isConnecting: false,
      error: null,
      onCompleteLesson: vi.fn(),
      service: mockService as any,
    };

    // 3. Render the component with mock data wrapped in BlockchainProvider
    render(
      <BlockchainProvider>
        <Dashboard {...mockData} />
      </BlockchainProvider>
    );

    // 3. Assert that the data is visible
    expect(screen.getByText(mockData.publicKey.hex)).toBeInTheDocument();
    expect(screen.getByText(mockData.peerId)).toBeInTheDocument();

    mockData.connectedPeers.forEach((peer) => {
      expect(screen.getByText(peer)).toBeInTheDocument();
    });
  });
}); 