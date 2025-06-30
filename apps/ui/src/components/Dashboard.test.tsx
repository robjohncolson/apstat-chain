import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { BlockchainProvider } from '../providers/BlockchainProvider';
import userEvent from '@testing-library/user-event';

describe('Dashboard', () => {
  it('should render wallet and network data correctly', () => {
    // 1. Define mock service
    const mockService = {
      getPendingContributionTotal: vi.fn().mockReturnValue(0.5),
      isEligibleToMine: vi.fn().mockReturnValue(false),
      getCandidateBlocks: vi.fn().mockReturnValue([]),
      getPendingTransactions: vi.fn().mockReturnValue([]),
      getConfirmedTransactions: vi.fn().mockReturnValue([]),
      isEligibleToAttest: vi.fn().mockReturnValue(false),
      submitAttestation: vi.fn(),
      getMiningPuzzle: vi.fn(),
      proposeBlock: vi.fn(),
      isActionPending: vi.fn().mockReturnValue(false),
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

  it('should switch between tabs correctly, showing the relevant content', async () => {
    const user = userEvent.setup();
    
    // 1. Define mock service
    const mockService = {
      getPendingContributionTotal: vi.fn().mockReturnValue(0.5),
      isEligibleToMine: vi.fn().mockReturnValue(false),
      getCandidateBlocks: vi.fn().mockReturnValue([]),
      getPendingTransactions: vi.fn().mockReturnValue([]),
      getConfirmedTransactions: vi.fn().mockReturnValue([]),
      isEligibleToAttest: vi.fn().mockReturnValue(false),
      submitAttestation: vi.fn(),
      getMiningPuzzle: vi.fn(),
      proposeBlock: vi.fn(),
      isActionPending: vi.fn().mockReturnValue(false),
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

    // 4. Verify Default Tab: "Network Activity" tab content is visible
    expect(screen.getByText('Network Progress')).toBeInTheDocument();

    // 5. Switch to Leaderboard: Find and click the "Leaderboard" tab button
    const leaderboardTab = screen.getByRole('tab', { name: /Leaderboard/i });
    await user.click(leaderboardTab);

    // 6. Verify Switch: Network Progress should no longer be visible, Leaderboard should be visible
    expect(screen.queryByText('Network Progress')).not.toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });
}); 