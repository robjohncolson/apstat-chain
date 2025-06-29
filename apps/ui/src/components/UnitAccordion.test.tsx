import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UnitAccordion } from './UnitAccordion'
import type BlockchainService from '../services/BlockchainService'
import type { BlockchainState } from '../services/BlockchainService'
import type { KeyPair } from '@apstat-chain/core'

describe('UnitAccordion', () => {
  it('should render unit titles and expand to show lessons on click', async () => {
    // Arrange
    const mockKeyPair: KeyPair = {
      publicKey: { 
        hex: 'test-public-key',
        bytes: new Uint8Array([1, 2, 3, 4])
      },
      privateKey: { 
        hex: 'test-private-key',
        bytes: new Uint8Array([5, 6, 7, 8])
      }
    }

    const mockState: BlockchainState = {
      isInitialized: true,
      currentKeyPair: mockKeyPair,
      mnemonic: 'test mnemonic',
      p2pNode: null,
      peerId: null,
      connectedPeers: [],
      blockchain: {} as any,
      pendingTransactions: [],
      candidateBlocks: new Map(),
      isConnecting: false,
      error: null,
      allTransactions: [],
      lastBlockMiner: null,
    }

    const mockLessons = [
      {
        id: 'lesson-1-1',
        title: 'Introduction to Data',
        unitId: 'unit-1',
        activities: [
          {
            id: 'activity-1',
            type: 'video',
            title: 'Video: Data Types',
            contribution: 0.5,
            completed: true
          }
        ]
      },
      {
        id: 'lesson-1-2',
        title: 'Collecting Data',
        unitId: 'unit-1',
        activities: [
          {
            id: 'activity-2',
            type: 'quiz',
            title: 'Quiz: Data Collection',
            contribution: 0.5,
            completed: false
          }
        ]
      },
      {
        id: 'lesson-2-1',
        title: 'Probability Basics',
        unitId: 'unit-2',
        activities: [
          {
            id: 'activity-3',
            type: 'video',
            title: 'Video: Probability',
            contribution: 0.5,
            completed: true
          }
        ]
      }
    ]

    const mockService: Partial<BlockchainService> = {
      getPersonalProgress: vi.fn().mockReturnValue(mockLessons)
    }

    // Act
    render(<UnitAccordion service={mockService as BlockchainService} state={mockState} />)

    // Assert
    expect(screen.getByText('Unit 1')).toBeInTheDocument()
    expect(screen.getByText('Unit 2')).toBeInTheDocument()

    // Initially, lesson titles should not be visible (accordion is collapsed)
    expect(screen.queryByText('Introduction to Data')).not.toBeInTheDocument()
    expect(screen.queryByText('Collecting Data')).not.toBeInTheDocument()
    expect(screen.queryByText('Probability Basics')).not.toBeInTheDocument()

    // Simulate clicking on Unit 1 header to expand
    const unit1Header = screen.getByText('Unit 1')
    fireEvent.click(unit1Header)

    // Now Unit 1 lessons should be visible
    expect(screen.getByText('Introduction to Data')).toBeInTheDocument()
    expect(screen.getByText('Collecting Data')).toBeInTheDocument()
    
    // Unit 2 lessons should still not be visible
    expect(screen.queryByText('Probability Basics')).not.toBeInTheDocument()

    // Verify that getPersonalProgress was called with the correct public key
    expect(mockService.getPersonalProgress).toHaveBeenCalledWith('test-public-key')
  })
}) 