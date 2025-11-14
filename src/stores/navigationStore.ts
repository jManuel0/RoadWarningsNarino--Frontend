// src/stores/navigationStore.ts
import { create } from "zustand";
import { Alert } from "@/types/Alert";

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  point: RoutePoint;
}

export interface Route {
  id: string;
  name: string;
  distance: number;
  duration: number;
  riskScore: number;
  points: RoutePoint[];
  steps: NavigationStep[];
  alertsOnRoute: Alert[];
  isRecommended: boolean;
}

interface NavigationState {
  isNavigating: boolean;
  currentLocation: RoutePoint | null;
  destination: RoutePoint | null;
  routes: Route[];
  selectedRoute: Route | null;
  currentStepIndex: number;
  routeHistory: RoutePoint[];
  alertsNearRoute: Alert[];
  needsReroute: boolean;

  startNavigation: (destination: RoutePoint) => void;
  stopNavigation: () => void;
  setCurrentLocation: (location: RoutePoint) => void;
  setDestination: (destination: RoutePoint) => void;
  setRoutes: (routes: Route[]) => void;
  selectRoute: (route: Route) => void;
  addToRouteHistory: (point: RoutePoint) => void;
  setCurrentStepIndex: (index: number) => void;
  setAlertsNearRoute: (alerts: Alert[]) => void;
  setNeedsReroute: (needs: boolean) => void;
  clearNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isNavigating: false,
  currentLocation: null,
  destination: null,
  routes: [],
  selectedRoute: null,
  currentStepIndex: 0,
  routeHistory: [],
  alertsNearRoute: [],
  needsReroute: false,

  startNavigation: (destination) =>
    set({
      isNavigating: true,
      destination,
      currentStepIndex: 0,
      routeHistory: [],
      needsReroute: false,
    }),

  stopNavigation: () =>
    set({
      isNavigating: false,
      destination: null,
      routes: [],
      selectedRoute: null,
      currentStepIndex: 0,
      routeHistory: [],
      needsReroute: false,
    }),

  setCurrentLocation: (location) => set({ currentLocation: location }),

  setDestination: (destination) => set({ destination }),

  setRoutes: (routes) => set({ routes }),

  selectRoute: (route) =>
    set({
      selectedRoute: route,
      currentStepIndex: 0,
    }),

  addToRouteHistory: (point) =>
    set((state) => ({
      routeHistory: [...state.routeHistory, point],
    })),

  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),

  setAlertsNearRoute: (alerts) =>
    set({
      alertsNearRoute: alerts,
      needsReroute: alerts.length > 0,
    }),

  setNeedsReroute: (needs) => set({ needsReroute: needs }),

  clearNavigation: () =>
    set({
      isNavigating: false,
      currentLocation: null,
      destination: null,
      routes: [],
      selectedRoute: null,
      currentStepIndex: 0,
      routeHistory: [],
      alertsNearRoute: [],
      needsReroute: false,
    }),
}));
