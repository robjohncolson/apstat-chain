import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "@/test/test-utils";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import BlockchainService from "@/services/BlockchainService";

const mockMnemonic = "test sponsor welcome friend remind wash jazz onion utility claw mask depend";

vi.mock("@/services/BlockchainService", () => {
  const serviceInstance = {
    generateNewWallet: vi.fn(),
    getWallet: vi.fn(),
    getMnemonic: vi.fn(),
    getState: vi.fn(),
    subscribe: vi.fn(() => () => {}),
    on: vi.fn(),
    off: vi.fn(),
  };
  // Mock the default export
  return {
    default: {
      getInstance: () => serviceInstance,
    },
  };
});

describe("OnboardingFlow", () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = BlockchainService.getInstance();
    (service.getState as vi.Mock).mockReturnValue({ isInitialized: false });
  });

  it('should display the "Generate New Account" button initially', () => {
    render(<OnboardingFlow onLogin={() => {}} />);
    expect(
      screen.getByRole("button", { name: /generate new account/i })
    ).toBeInTheDocument();
  });

  it("should call generateNewWallet and display the mnemonic when the button is clicked", async () => {
    (service.generateNewWallet as vi.Mock).mockResolvedValue({
      mnemonic: mockMnemonic,
    });

    render(<OnboardingFlow onLogin={() => {}} />);

    const generateButton = screen.getByRole("button", {
      name: /generate new account/i,
    });
    fireEvent.click(generateButton);

    await screen.findByText("test");

    expect(service.generateNewWallet).toHaveBeenCalled();
    expect(screen.getByText("depend")).toBeInTheDocument();
  });

  it('should call onLogin and persist mnemonic when continue is clicked', async () => {
    (service.generateNewWallet as vi.Mock).mockResolvedValue({ mnemonic: mockMnemonic });
    (service.getMnemonic as vi.Mock).mockReturnValue(mockMnemonic);
    const handleLogin = vi.fn();

    render(<OnboardingFlow onLogin={handleLogin} />);
    
    // Generate wallet and show mnemonic
    fireEvent.click(screen.getByRole("button", { name: /generate new account/i }));
    await screen.findByText("test");

    // Click checkbox and continue
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(handleLogin).toHaveBeenCalled();
  });
});