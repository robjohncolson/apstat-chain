// src/test/test-utils.tsx
import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { BlockchainProvider } from "@/providers/BlockchainProvider";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BlockchainProvider>{children}</BlockchainProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };