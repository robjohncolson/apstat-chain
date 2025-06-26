import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

describe('Dashboard', () => {
  it('should render wallet and network data correctly', () => {
    // 1. Define mock data
    const mockData = {
      publicKey: { hex: '02_FAKE_PUBLIC_KEY', bytes: new Uint8Array() },
      peerId: 'FAKE_PEER_ID',
      connectedPeers: ['PEER_1', 'PEER_2', 'PEER_3'],
      isConnecting: false,
      error: null,
      onCompleteLesson: vi.fn(),
      onMinePendingTransactions: vi.fn(),
      pendingTransactionsCount: 0,
    };

    // 2. Render the component with mock data
    render(<Dashboard {...mockData} />);

    // 3. Assert that the data is visible
    expect(screen.getByText(mockData.publicKey.hex)).toBeInTheDocument();
    expect(screen.getByText(mockData.peerId)).toBeInTheDocument();

    mockData.connectedPeers.forEach((peer) => {
      expect(screen.getByText(peer)).toBeInTheDocument();
    });
  });
}); 