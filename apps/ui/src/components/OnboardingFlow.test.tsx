import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { BlockchainProvider } from '../providers/BlockchainProvider'
import BlockchainService from '../services/BlockchainService'
import { OnboardingFlow } from './OnboardingFlow'

// Mock the BlockchainService
vi.mock('../services/BlockchainService', () => {
  const mockService = {
    getInstance: vi.fn(() => ({
      generateNewWallet: vi.fn(),
      subscribe: vi.fn(() => vi.fn()),
      getState: vi.fn(() => ({
        isInitialized: false,
        currentKeyPair: null,
        mnemonic: null,
        p2pNode: null,
        peerId: null,
        connectedPeers: [],
        transactions: [],
        isConnecting: false,
        error: null,
      })),
    })),
  }
  return {
    default: mockService,
  }
})

// Mock onLogin function
const mockOnLogin = vi.fn()

const renderOnboardingFlow = () => {
  return render(
    <BlockchainProvider>
      <OnboardingFlow onLogin={mockOnLogin} />
    </BlockchainProvider>
  )
}

describe('OnboardingFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('displays a "Generate New Account" button', () => {
      renderOnboardingFlow()
      
      const generateButton = screen.getByRole('button', { name: /generate new account/i })
      expect(generateButton).toBeInTheDocument()
    })

    it('does not show mnemonic phrase initially', () => {
      renderOnboardingFlow()
      
      expect(screen.queryByText(/your recovery phrase/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/i have saved my phrase/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
    })
  })

  describe('Mnemonic Generation', () => {
    it('generates and displays a 12-word mnemonic phrase when button is clicked', async () => {
      const user = userEvent.setup()
      const mockGenerateWallet = vi.fn().mockResolvedValue({
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        keyPair: { publicKey: 'mock-public', privateKey: 'mock-private' }
      })

      BlockchainService.getInstance = vi.fn(() => ({
        generateNewWallet: mockGenerateWallet,
        subscribe: vi.fn(() => vi.fn()),
        getState: vi.fn(() => ({
          isInitialized: false,
          currentKeyPair: null,
          mnemonic: null,
          p2pNode: null,
          peerId: null,
          connectedPeers: [],
          transactions: [],
          isConnecting: false,
          error: null,
        })),
      }))

      renderOnboardingFlow()
      
      const generateButton = screen.getByRole('button', { name: /generate new account/i })
      await user.click(generateButton)

      await waitFor(() => {
        expect(mockGenerateWallet).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(screen.getByText(/your recovery phrase/i)).toBeInTheDocument()
        // Check for individual words since they're rendered in separate elements
        expect(screen.getAllByText('abandon')).toHaveLength(11)
        expect(screen.getByText('about')).toBeInTheDocument()
      })
    })

    it('shows checkbox and disabled continue button after mnemonic generation', async () => {
      const user = userEvent.setup()
      const mockGenerateWallet = vi.fn().mockResolvedValue({
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        keyPair: { publicKey: 'mock-public', privateKey: 'mock-private' }
      })

      BlockchainService.getInstance = vi.fn(() => ({
        generateNewWallet: mockGenerateWallet,
        subscribe: vi.fn(() => vi.fn()),
        getState: vi.fn(() => ({
          isInitialized: false,
          currentKeyPair: null,
          mnemonic: null,
          p2pNode: null,
          peerId: null,
          connectedPeers: [],
          transactions: [],
          isConnecting: false,
          error: null,
        })),
      }))

      renderOnboardingFlow()
      
      const generateButton = screen.getByRole('button', { name: /generate new account/i })
      await user.click(generateButton)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /i have saved my phrase/i })
        const continueButton = screen.getByRole('button', { name: /continue/i })
        
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).not.toBeChecked()
        expect(continueButton).toBeInTheDocument()
        expect(continueButton).toBeDisabled()
      })
    })
  })

  describe('Continue Button Interaction', () => {
    it('enables continue button only when checkbox is checked', async () => {
      const user = userEvent.setup()
      const mockGenerateWallet = vi.fn().mockResolvedValue({
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        keyPair: { publicKey: 'mock-public', privateKey: 'mock-private' }
      })

      BlockchainService.getInstance = vi.fn(() => ({
        generateNewWallet: mockGenerateWallet,
        subscribe: vi.fn(() => vi.fn()),
        getState: vi.fn(() => ({
          isInitialized: false,
          currentKeyPair: null,
          mnemonic: null,
          p2pNode: null,
          peerId: null,
          connectedPeers: [],
          transactions: [],
          isConnecting: false,
          error: null,
        })),
      }))

      renderOnboardingFlow()
      
      const generateButton = screen.getByRole('button', { name: /generate new account/i })
      await user.click(generateButton)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /i have saved my phrase/i })
        const continueButton = screen.getByRole('button', { name: /continue/i })
        
        expect(continueButton).toBeDisabled()
        
        return user.click(checkbox)
      })

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continue/i })
        expect(continueButton).toBeEnabled()
      })
    })

    it('calls onLogin function when continue button is clicked', async () => {
      const user = userEvent.setup()
      const mockGenerateWallet = vi.fn().mockResolvedValue({
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        keyPair: { publicKey: 'mock-public', privateKey: 'mock-private' }
      })

      BlockchainService.getInstance = vi.fn(() => ({
        generateNewWallet: mockGenerateWallet,
        subscribe: vi.fn(() => vi.fn()),
        getState: vi.fn(() => ({
          isInitialized: false,
          currentKeyPair: null,
          mnemonic: null,
          p2pNode: null,
          peerId: null,
          connectedPeers: [],
          transactions: [],
          isConnecting: false,
          error: null,
        })),
      }))

      renderOnboardingFlow()
      
      const generateButton = screen.getByRole('button', { name: /generate new account/i })
      await user.click(generateButton)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /i have saved my phrase/i })
        return user.click(checkbox)
      })

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continue/i })
        return user.click(continueButton)
      })

      expect(mockOnLogin).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('displays error message when wallet generation fails', async () => {
      const user = userEvent.setup()
      const mockGenerateWallet = vi.fn().mockRejectedValue(new Error('Failed to generate wallet'))

      BlockchainService.getInstance = vi.fn(() => ({
        generateNewWallet: mockGenerateWallet,
        subscribe: vi.fn(() => vi.fn()),
        getState: vi.fn(() => ({
          isInitialized: false,
          currentKeyPair: null,
          mnemonic: null,
          p2pNode: null,
          peerId: null,
          connectedPeers: [],
          transactions: [],
          isConnecting: false,
          error: null,
        })),
      }))

      renderOnboardingFlow()
      
      const generateButton = screen.getByRole('button', { name: /generate new account/i })
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to generate wallet/i)).toBeInTheDocument()
      })
    })
  })
}) 