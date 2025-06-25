import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import { render } from "@/test/test-utils";
import App from "@/App";

let mockServiceInstance: any;

vi.mock("@/services/BlockchainService", () => {
  const mockWallet = {
    address: "0x123",
    balance: "100",
    mnemonic: "test mnemonic",
  };

  const mockInitialState = {
    isInitialized: false,
    currentKeyPair: null,
    mnemonic: null,
    p2pNode: null,
    peerId: null,
    connectedPeers: [],
    transactions: [],
    isConnecting: false,
    error: null,
  };

  const createMockService = () => {
    let listeners = new Set<(state: any) => void>();
    let mockState: any = { ...mockInitialState };

    const service = {
      restoreWallet: vi.fn().mockImplementation(async (mnemonic) => {
        if (!mnemonic) {
          return null;
        }
        mockState = {
          ...mockState,
          isInitialized: true,
          mnemonic: mnemonic,
          currentKeyPair: { publicKey: { hex: "0xmockpubkey" } },
        };
        act(() => {
          listeners.forEach((l) => l(mockState));
        });
        return mockWallet;
      }),
      getState: vi.fn(() => mockState),
      subscribe: vi.fn((listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }),
      getLeaderboard: vi.fn().mockResolvedValue([]),
      getLedger: vi.fn().mockResolvedValue([]),
      initializeP2P: vi.fn().mockResolvedValue("mock-peer-id"),
      on: vi.fn(),
      off: vi.fn(),
      __reset: () => {
        listeners = new Set();
        mockState = { ...mockInitialState };
      },
    };
    return service;
  };

  let instance: any;
  return {
    default: {
      getInstance: () => {
        if (!instance) {
          instance = createMockService();
        }
        return instance;
      },
    },
  };
});

describe("App", () => {
  beforeEach(async () => {
    const BlockchainService = (await import("@/services/BlockchainService"))
      .default;
    mockServiceInstance = BlockchainService.getInstance();
    vi.clearAllMocks();
    (mockServiceInstance as any).__reset();
    localStorage.clear();
  });

  it("should show OnboardingFlow when no wallet is in localStorage", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /welcome to apstat chain/i })
    ).toBeInTheDocument();
  });

  it("should show Dashboard when wallet is restored from localStorage", async () => {
    localStorage.setItem("apstat-mnemonic", "test-mnemonic");

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /dashboard/i })
      ).toBeInTheDocument();
    });

    expect(mockServiceInstance.restoreWallet).toHaveBeenCalledWith(
      "test-mnemonic"
    );
  });
});