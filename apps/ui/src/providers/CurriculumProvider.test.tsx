import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { CurriculumProvider, useCurriculum } from './CurriculumProvider';
import { CurriculumManager } from '@apstat-chain/data';
import type { 
  CurriculumUnit, 
  TotalCounts, 
  CompletionStats,
  BlockchainIntegration 
} from '@apstat-chain/data';

// Mock the BlockchainProvider
const mockBlockchainService: BlockchainIntegration = {
  createTransaction: vi.fn().mockReturnValue({ id: 'mock-tx', signature: 'mock-sig' }),
  getState: vi.fn().mockReturnValue({
    isInitialized: true,
    currentKeyPair: { publicKey: 'mock-key' }
  })
};

const mockUseBlockchain = vi.fn(() => ({
  service: mockBlockchainService
}));

vi.mock('./BlockchainProvider', () => ({
  useBlockchain: () => mockUseBlockchain()
}));

// Mock CurriculumManager
vi.mock('@apstat-chain/data', async () => {
  const actual = await vi.importActual('@apstat-chain/data');
  return {
    ...actual,
    CurriculumManager: vi.fn()
  };
});

// Test data matching the existing curriculum structure
const mockCurriculumData: CurriculumUnit[] = [
  {
    unitId: 'unit1',
    displayName: 'Unit 1: Exploring One-Variable Data',
    examWeight: '15-23%',
    topics: [
      {
        id: '1-1',
        name: 'Topic 1.1',
        description: 'Introducing Statistics: What Can We Learn from Data?',
        videos: [
          {
            url: 'https://example.com/video1',
            altUrl: 'https://alt.com/video1',
            completed: false,
            completionDate: null
          }
        ],
        quizzes: [],
        blooket: {
          url: 'https://blooket.com/set/123',
          completed: true,
          completionDate: '2024-01-01T00:00:00.000Z'
        },
        origami: {
          name: 'Paper Airplane',
          description: 'Perfect starter',
          videoUrl: 'https://youtube.com/origami1',
          reflection: 'Think about data exploration'
        },
        current: false
      },
      {
        id: '1-2',
        name: 'Topic 1.2',
        description: 'The Language of Variation: Variables',
        videos: [
          {
            url: 'https://example.com/video2',
            altUrl: null,
            completed: true,
            completionDate: '2024-01-02T00:00:00.000Z'
          }
        ],
        quizzes: [
          {
            questionPdf: 'path/to/quiz.pdf',
            answersPdf: 'path/to/answers.pdf',
            quizId: '1-2_q1',
            completed: false,
            completionDate: null
          }
        ],
        blooket: {
          url: 'https://blooket.com/set/456',
          completed: false,
          completionDate: null
        },
        origami: {
          name: 'Simple Boat',
          description: 'Navigate variables',
          videoUrl: 'https://youtube.com/boat',
          reflection: 'Reflect on variation'
        },
        current: false
      }
    ]
  }
];

const mockTotalCounts: TotalCounts = {
  videos: 2,
  quizzes: 1,
  blookets: 2
};

const mockCompletionStats: CompletionStats = {
  videos: { completed: 1, total: 2, percentage: 50 },
  quizzes: { completed: 0, total: 1, percentage: 0 },
  blookets: { completed: 1, total: 2, percentage: 50 },
  overall: { completed: 2, total: 5, percentage: 40 }
};

// Test component to access context
function TestComponent() {
  const context = useCurriculum();
  return (
    <div>
      <div data-testid="loading">{context.isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="units-count">{context.units.length}</div>
      <div data-testid="total-videos">{context.totalCounts.videos}</div>
      <div data-testid="completion-percentage">{context.completionStats.overall.percentage}</div>
      <button 
        data-testid="refresh-button" 
        onClick={context.refreshData}
      >
        Refresh
      </button>
    </div>
  );
}

describe('CurriculumProvider', () => {
  let mockCurriculumManager: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock manager instance
    mockCurriculumManager = {
      getAllUnits: vi.fn().mockReturnValue(mockCurriculumData),
      getTotalCounts: vi.fn().mockReturnValue(mockTotalCounts),
      getCompletionStats: vi.fn().mockReturnValue(mockCompletionStats),
      markVideoCompleted: vi.fn().mockResolvedValue(undefined),
      markQuizCompleted: vi.fn().mockResolvedValue(undefined),
      markBlooketCompleted: vi.fn().mockResolvedValue(undefined)
    };

    // Mock the CurriculumManager constructor
    (CurriculumManager as Mock).mockImplementation(() => mockCurriculumManager);
  });

  describe('Initialization and Loading States', () => {
    it('should show loading state during initialization', async () => {
      // Mock a slow initialization to catch loading state
      const slowManager = {
        ...mockCurriculumManager,
        getAllUnits: vi.fn().mockImplementation(() => {
          return new Promise(resolve => setTimeout(() => resolve(mockCurriculumData), 100));
        })
      };
      (CurriculumManager as Mock).mockImplementation(() => slowManager);

      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      // Should show loading initially
      expect(screen.getByText('Initializing Curriculum...')).toBeInTheDocument();
      
      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      }, { timeout: 2000 });
    });

    it('should show loading spinner component during initialization', async () => {
      // Use the slow manager again
      const slowManager = {
        ...mockCurriculumManager,
        getAllUnits: vi.fn().mockImplementation(() => {
          return new Promise(resolve => setTimeout(() => resolve(mockCurriculumData), 50));
        })
      };
      (CurriculumManager as Mock).mockImplementation(() => slowManager);

      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      // Should show the loading spinner UI
      expect(screen.getByText('Initializing Curriculum...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument(); // loading spinner
      
      // Wait for it to finish
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      }, { timeout: 1000 });
    });

    it('should not initialize when blockchain service is not available', () => {
      mockUseBlockchain.mockReturnValueOnce({ service: null });

      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      // Should remain in loading state
      expect(screen.getByText('Initializing Curriculum...')).toBeInTheDocument();
      expect(CurriculumManager).not.toHaveBeenCalled();
    });

    it('should initialize with blockchain service dependency injection', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(CurriculumManager).toHaveBeenCalledWith(undefined, mockBlockchainService);
    });
  });

  describe('Successful Data Loading', () => {
    it('should load and provide curriculum data successfully', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      expect(screen.getByTestId('total-videos')).toHaveTextContent('2');
      expect(screen.getByTestId('completion-percentage')).toHaveTextContent('40');
    });

    it('should call manager methods during initialization', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(mockCurriculumManager.getAllUnits).toHaveBeenCalled();
      expect(mockCurriculumManager.getTotalCounts).toHaveBeenCalled();
      expect(mockCurriculumManager.getCompletionStats).toHaveBeenCalled();
    });

    it('should refresh data when refreshData is called', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Clear previous calls
      vi.clearAllMocks();

      // Trigger refresh
      act(() => {
        screen.getByTestId('refresh-button').click();
      });

      expect(mockCurriculumManager.getAllUnits).toHaveBeenCalled();
      expect(mockCurriculumManager.getTotalCounts).toHaveBeenCalled();
      expect(mockCurriculumManager.getCompletionStats).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Make manager constructor throw
      (CurriculumManager as Mock).mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      // When initialization fails, it stays in loading state
      await waitFor(() => {
        expect(screen.getByText('Initializing Curriculum...')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize CurriculumManager:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle manager method errors during initialization', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockCurriculumManager.getAllUnits.mockImplementation(() => {
        throw new Error('Failed to get units');
      });

      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle refreshData errors gracefully', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Make getAllUnits throw during refresh
      mockCurriculumManager.getAllUnits.mockImplementation(() => {
        throw new Error('Refresh failed');
      });

      // Should not throw when refresh is called
      expect(() => {
        act(() => {
          screen.getByTestId('refresh-button').click();
        });
      }).not.toThrow();
    });
  });

  describe('Completion Methods', () => {
    let TestCompletionComponent: React.FC;

    beforeEach(() => {
      TestCompletionComponent = function() {
        const { markVideoCompleted, markQuizCompleted, markBlooketCompleted } = useCurriculum();
        
        return (
          <div>
            <button 
              data-testid="mark-video" 
              onClick={() => markVideoCompleted('unit1', '1-1', 0)}
            >
              Mark Video
            </button>
            <button 
              data-testid="mark-quiz" 
              onClick={() => markQuizCompleted('unit1', '1-2', 0)}
            >
              Mark Quiz
            </button>
            <button 
              data-testid="mark-blooket" 
              onClick={() => markBlooketCompleted('unit1', '1-1')}
            >
              Mark Blooket
            </button>
          </div>
        );
      };
    });

    it('should mark video as completed successfully', async () => {
      render(
        <CurriculumProvider>
          <TestCompletionComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mark-video')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByTestId('mark-video').click();
      });

      expect(mockCurriculumManager.markVideoCompleted).toHaveBeenCalledWith('unit1', '1-1', 0);
    });

    it('should mark quiz as completed successfully', async () => {
      render(
        <CurriculumProvider>
          <TestCompletionComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mark-quiz')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByTestId('mark-quiz').click();
      });

      expect(mockCurriculumManager.markQuizCompleted).toHaveBeenCalledWith('unit1', '1-2', 0);
    });

    it('should mark blooket as completed successfully', async () => {
      render(
        <CurriculumProvider>
          <TestCompletionComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mark-blooket')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByTestId('mark-blooket').click();
      });

      expect(mockCurriculumManager.markBlooketCompleted).toHaveBeenCalledWith('unit1', '1-1');
    });

    it('should handle completion method errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockCurriculumManager.markVideoCompleted.mockRejectedValue(new Error('Completion failed'));

      render(
        <CurriculumProvider>
          <TestCompletionComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mark-video')).toBeInTheDocument();
      });

      // The error should be caught and logged, but still reject
      let errorThrown = false;
      try {
        await act(async () => {
          await screen.getByTestId('mark-video').click();
        });
      } catch (error) {
        errorThrown = true;
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Completion failed');
      }

      expect(errorThrown).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to mark video as completed:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should refresh data after successful completion', async () => {
      render(
        <CurriculumProvider>
          <TestCompletionComponent />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mark-video')).toBeInTheDocument();
      });

      // Clear initial calls
      vi.clearAllMocks();

      await act(async () => {
        screen.getByTestId('mark-video').click();
      });

      // Should call refresh methods after completion
      expect(mockCurriculumManager.getAllUnits).toHaveBeenCalled();
      expect(mockCurriculumManager.getTotalCounts).toHaveBeenCalled();
      expect(mockCurriculumManager.getCompletionStats).toHaveBeenCalled();
    });
  });

  describe('Context Usage', () => {
    it('should throw error when useCurriculum is used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useCurriculum must be used within a CurriculumProvider');

      consoleSpy.mockRestore();
    });

    it('should provide all required context values', async () => {
      let contextValue: any;
      
      function ContextCapture() {
        contextValue = useCurriculum();
        return <div>Context captured</div>;
      }

      render(
        <CurriculumProvider>
          <ContextCapture />
        </CurriculumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Context captured')).toBeInTheDocument();
      });

      expect(contextValue).toEqual({
        manager: mockCurriculumManager,
        units: mockCurriculumData,
        totalCounts: mockTotalCounts,
        completionStats: mockCompletionStats,
        isLoading: false,
        refreshData: expect.any(Function),
        markVideoCompleted: expect.any(Function),
        markQuizCompleted: expect.any(Function),
        markBlooketCompleted: expect.any(Function)
      });
    });
  });
});
