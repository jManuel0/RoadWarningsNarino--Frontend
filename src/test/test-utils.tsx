import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import type {
  AxiosError,
  AxiosResponse,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";

type MockAlert = {
  id: number;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  municipality: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  verificationScore: number;
};

type MockUser = {
  username: string;
  email: string;
  level: number;
  points: number;
};

// Wrapper for components that need routing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Custom render that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Helper to create mock alerts
export const createMockAlert = (
  overrides: Partial<MockAlert> = {}
): MockAlert => ({
  id: 1,
  type: "ACCIDENTE",
  severity: "ALTA",
  status: "ACTIVE",
  title: "Test Alert",
  description: "Test Description",
  latitude: 1.2136,
  longitude: -77.2811,
  address: "Test Address",
  municipality: "Pasto",
  createdBy: "testuser",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  upvotes: 0,
  downvotes: 0,
  verificationScore: 0,
  ...overrides,
});

// Helper to create mock user
export const createMockUser = (
  overrides: Partial<MockUser> = {}
): MockUser => ({
  username: "testuser",
  email: "test@example.com",
  level: 1,
  points: 0,
  ...overrides,
});

// Mock localStorage
export const mockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

// Mock WebSocket
export class MockWebSocket {
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }

  send = jest.fn();
  close = jest.fn();

  // Helper to simulate receiving a message
  simulateMessage<T>(data: T) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

// Mock fetch
export const mockFetch = <T,>(response: T, ok = true) => {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: async () => response,
      text: async () => JSON.stringify(response),
    })
  );
};

// Mock axios response
export const mockAxiosResponse = <T,>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {
    headers: {} as AxiosRequestHeaders,
  } as InternalAxiosRequestConfig,
});

// Mock axios error
export const mockAxiosError = (
  message: string,
  status = 400
): AxiosError<{ message: string }> =>
  ({
    response: {
      data: { message },
      status,
      statusText: "Bad Request",
      headers: {},
      config: {
        headers: {} as AxiosRequestHeaders,
      } as InternalAxiosRequestConfig,
    },
    message,
    isAxiosError: true,
    toJSON: () => ({}),
    name: "AxiosError",
    config: {
      headers: {} as AxiosRequestHeaders,
    } as InternalAxiosRequestConfig,
    code: status.toString(),
  }) as AxiosError<{ message: string }>;
