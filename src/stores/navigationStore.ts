// src/stores/navigationStore.ts
import { create } from "zustand";
import { Alert } from "@/types/Alert";

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface SavedDestination {
  id: string;
  name: string;
  location: RoutePoint;
  lastUsedAt: number;
  favorite: boolean;
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
  savedDestinations: SavedDestination[];

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
  addRecentDestination: (name: string, location: RoutePoint) => void;
  toggleFavoriteDestination: (id: string) => void;
  clearSavedDestinations: () => void;
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
  savedDestinations: [],

  addRecentDestination: (name, location) =>
    set((state) => {
      const id = `${location.lat.toFixed(6)},${location.lng.toFixed(6)}`;
      const existing = state.savedDestinations.find((d) => d.id === id);

      let updated: SavedDestination[];
      if (existing) {
        updated = state.savedDestinations.map((d) =>
          d.id === id ? { ...d, name, lastUsedAt: Date.now() } : d
        );
      } else {
        const newDest: SavedDestination = {
          id,
          name,
          location,
          lastUsedAt: Date.now(),
          favorite: false,
        };
        updated = [newDest, ...state.savedDestinations];
      }

      // Mantener solo los 10 más recientes
      updated.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
      updated = updated.slice(0, 10);

      return { savedDestinations: updated };
    }),

  toggleFavoriteDestination: (id) =>
    set((state) => ({
      savedDestinations: state.savedDestinations.map((d) =>
        d.id === id ? { ...d, favorite: !d.favorite } : d
      ),
    })),

  clearSavedDestinations: () =>
    set({
      savedDestinations: [],
    }),

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
