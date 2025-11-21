// src/services/routing.ts
import { NavigationStep, Route, RoutePoint } from "@/stores/navigationStore";

export type RoutingProfile = "driving" | "walking" | "cycling";

/**
 * Obtiene rutas reales por calles entre dos puntos usando OSRM.
 * Devuelve una o varias rutas en el formato interno de la app.
 */
export async function getOsrmRoutes(
  start: RoutePoint,
  end: RoutePoint,
  profile: RoutingProfile = "driving"
): Promise<
  Omit<Route, "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended">[]
> {
  const url = new URL(
    `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}`
  );

  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "true");
  url.searchParams.set("alternatives", "true");
  url.searchParams.set("language", "es");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `Error al obtener rutas OSRM: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
    throw new Error("OSRM no devolvió rutas");
  }

  interface OSRMRoute {
    geometry: { coordinates: [number, number][] };
    distance: number;
    duration: number;
    legs: Array<{
      steps: Array<{
        name?: string;
        distance: number;
        duration: number;
        maneuver?: {
          instruction?: string;
          location?: [number, number];
        };
        geometry?: { coordinates: [number, number][] };
      }>;
    }>;
  }

  return (data.routes as OSRMRoute[]).map((osrmRoute) => {
    const points: RoutePoint[] = osrmRoute.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );

    const distanceKm = osrmRoute.distance / 1000;
    const durationSec = osrmRoute.duration;

    const steps: NavigationStep[] = [];

    osrmRoute.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        const maneuver = step.maneuver ?? {};
        const instructionText: string =
          maneuver.instruction || step.name || "Sigue la ruta indicada";

        const maneuverLocation = maneuver.location;

        const [mLng, mLat] =
          maneuverLocation ??
          (step.geometry?.coordinates?.[0] as [number, number]);

        steps.push({
          instruction: instructionText,
          distance: step.distance / 1000,
          duration: step.duration,
          point: {
            lat: mLat,
            lng: mLng,
          },
        });
      });
    });

    const baseRoute: Omit<
      Route,
      "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended"
    > = {
      points,
      distance: distanceKm,
      duration: durationSec,
      steps,
    };

    return baseRoute;
  });
}
