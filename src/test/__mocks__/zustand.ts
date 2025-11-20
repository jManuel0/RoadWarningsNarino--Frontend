import { act } from "@testing-library/react";
import type { StateCreator, StoreApi } from "zustand";

const actualCreate =
  jest.requireActual<typeof import("zustand")>("zustand").create;

// Store state for each mock store
const storeResetFns = new Set<() => void>();

// Create a version of create that tracks the store reset function
export const create = <TState>(
  createState: StateCreator<TState, [], []>
): StoreApi<TState> => {
  const store = actualCreate(createState);
  const initialState = store.getState();

  // Track the reset function
  const reset = () => {
    store.setState(initialState, true);
  };
  storeResetFns.add(reset);

  return store;
};

// Helper to reset all stores
export const resetAllStores = () => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn();
    });
  });
};

// Re-export everything else from zustand
export * from "zustand";
