/**
 * Servicio de Geocoding y búsqueda de lugares de interés
 * Usa Nominatim OSM para geocoding y Overpass API para POIs
 */

export interface PlaceResult {
  id: string;
  name: string;
  displayName: string;
  address: string;
  lat: number;
  lng: number;
  type: PlaceType;
  category?: string;
  icon?: string;
  distance?: number; // Distancia desde ubicación actual en km
  isOpen?: boolean;
  rating?: number;
}

export enum PlaceType {
  ADDRESS = "ADDRESS",
  RESTAURANT = "RESTAURANT",
  HOTEL = "HOTEL",
  GAS_STATION = "GAS_STATION",
  SHOPPING_MALL = "SHOPPING_MALL",
  HOSPITAL = "HOSPITAL",
  PHARMACY = "PHARMACY",
  BANK = "BANK",
  ATM = "ATM",
  PARKING = "PARKING",
  POLICE = "POLICE",
  SCHOOL = "SCHOOL",
  PARK = "PARK",
  LANDMARK = "LANDMARK",
  TRANSPORT = "TRANSPORT",
  OTHER = "OTHER",
}

export interface PlaceCategory {
  id: string;
  name: string;
  icon: string;
  osmKey: string;
  osmValue: string;
  color: string;
}

// Categorías de búsqueda como Google Maps
export const PLACE_CATEGORIES: PlaceCategory[] = [
  {
    id: "restaurants",
    name: "Restaurantes",
    icon: "🍽️",
    osmKey: "amenity",
    osmValue: "restaurant",
    color: "#f97316",
  },
  {
    id: "hotels",
    name: "Hoteles",
    icon: "🏨",
    osmKey: "tourism",
    osmValue: "hotel",
    color: "#3b82f6",
  },
  {
    id: "gas_stations",
    name: "Gasolineras",
    icon: "⛽",
    osmKey: "amenity",
    osmValue: "fuel",
    color: "#eab308",
  },
  {
    id: "shopping",
    name: "Centros Comerciales",
    icon: "🛍️",
    osmKey: "shop",
    osmValue: "mall",
    color: "#ec4899",
  },
  {
    id: "hospitals",
    name: "Hospitales",
    icon: "🏥",
    osmKey: "amenity",
    osmValue: "hospital",
    color: "#ef4444",
  },
  {
    id: "pharmacies",
    name: "Farmacias",
    icon: "💊",
    osmKey: "amenity",
    osmValue: "pharmacy",
    color: "#10b981",
  },
  {
    id: "banks",
    name: "Bancos",
    icon: "🏦",
    osmKey: "amenity",
    osmValue: "bank",
    color: "#6366f1",
  },
  {
    id: "parking",
    name: "Parqueaderos",
    icon: "🅿️",
    osmKey: "amenity",
    osmValue: "parking",
    color: "#8b5cf6",
  },
  {
    id: "cafes",
    name: "Cafés",
    icon: "☕",
    osmKey: "amenity",
    osmValue: "cafe",
    color: "#a855f7",
  },
  {
    id: "bars",
    name: "Bares",
    icon: "🍺",
    osmKey: "amenity",
    osmValue: "bar",
    color: "#f59e0b",
  },
];

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  name?: string;
  address?: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    amenity?: string;
    shop?: string;
    tourism?: string;
    "addr:street"?: string;
    "addr:housenumber"?: string;
    "addr:city"?: string;
    opening_hours?: string;
    phone?: string;
  };
}

class GeocodingService {
  private readonly nominatimBaseUrl = "https://nominatim.openstreetmap.org";
  private readonly overpassBaseUrl = "https://overpass-api.de/api/interpreter";
  private readonly requestDelay = 1000; // 1 segundo entre requests (rate limit de Nominatim)
  private lastRequestTime = 0;

  // Coordenadas de Pasto, Nariño (centro de referencia)
  private readonly PASTO_CENTER = {
    lat: 1.2136,
    lng: -77.2811,
  };

  // Bounding box para el Departamento de Nariño
  // Formato: [min_lon, min_lat, max_lon, max_lat]
  private readonly NARINO_BBOX = "-79.0,-0.5,-76.5,2.5";

  // Cache de búsquedas
  private searchCache = new Map<string, PlaceResult[]>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutos

  /**
   * Buscar lugares por texto (autocompletado)
   * OPTIMIZADO PARA PASTO, NARIÑO
   */
  async searchPlaces(
    query: string,
    userLocation?: { lat: number; lng: number },
    limit = 10
  ): Promise<PlaceResult[]> {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = `${query}-${userLocation?.lat}-${userLocation?.lng}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached) return cached;

    await this.waitForRateLimit();

    try {
      const url = new URL(`${this.nominatimBaseUrl}/search`);

      // Si el usuario no especificó una ciudad, agregar "Pasto" automáticamente
      const searchQuery =
        query.toLowerCase().includes("pasto") ||
        query.toLowerCase().includes("nariño") ||
        query.toLowerCase().includes("narino")
          ? query
          : `${query}, Pasto, Nariño`;

      url.searchParams.set("q", searchQuery);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("countrycodes", "co"); // Restringir a Colombia

      // BIAS GEOGRÁFICO: Priorizar resultados cerca de Pasto, Nariño
      // Si hay ubicación del usuario, usar esa; si no, usar Pasto como referencia
      const searchLat = userLocation?.lat ?? this.PASTO_CENTER.lat;
      const searchLng = userLocation?.lng ?? this.PASTO_CENTER.lng;

      url.searchParams.set("lat", String(searchLat));
      url.searchParams.set("lon", String(searchLng));

      // Bounding box para Nariño (limita búsquedas al departamento)
      url.searchParams.set("bounded", "1"); // Activar búsqueda limitada
      url.searchParams.set("viewbox", this.NARINO_BBOX);

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "RoadWarnings/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Error en Nominatim: ${response.status}`);
      }

      const data: NominatimResult[] = await response.json();
      const results = data.map((item) =>
        this.parseNominatimResult(item, userLocation ?? this.PASTO_CENTER)
      );

      // Cachear resultados
      this.searchCache.set(cacheKey, results);
      setTimeout(() => this.searchCache.delete(cacheKey), this.cacheExpiry);

      return results;
    } catch (error) {
      console.error("Error buscando lugares:", error);
      return [];
    }
  }

  /**
   * Buscar lugares cercanos por categoría (como Google Maps)
   * OPTIMIZADO PARA PASTO, NARIÑO
   */
  async searchNearbyPlaces(
    center: { lat: number; lng: number },
    category: PlaceCategory,
    radiusKm = 10 // Aumentado de 5 a 10 km para cubrir mejor Pasto
  ): Promise<PlaceResult[]> {
    try {
      // Construir query de Overpass API
      // Buscar dentro del radio especificado centrado en la ubicación dada
      const query = `
        [out:json][timeout:25];
        (
          node["${category.osmKey}"="${category.osmValue}"](around:${radiusKm * 1000},${center.lat},${center.lng});
          way["${category.osmKey}"="${category.osmValue}"](around:${radiusKm * 1000},${center.lat},${center.lng});
          relation["${category.osmKey}"="${category.osmValue}"](around:${radiusKm * 1000},${center.lat},${center.lng});
        );
        out center;
      `;

      const response = await fetch(this.overpassBaseUrl, {
        method: "POST",
        body: query,
      });

      if (!response.ok) {
        throw new Error(`Error en Overpass API: ${response.status}`);
      }

      const data = await response.json();
      const elements: OverpassElement[] = data.elements || [];

      return elements
        .map((el) => this.parseOverpassElement(el, center, category))
        .filter((place): place is PlaceResult => place !== null)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 30); // Aumentado de 20 a 30 resultados para mejor cobertura
    } catch (error) {
      console.error("Error buscando lugares cercanos:", error);
      return [];
    }
  }

  /**
   * Geocodificación inversa (obtener dirección de coordenadas)
   */
  async reverseGeocode(lat: number, lng: number): Promise<PlaceResult | null> {
    await this.waitForRateLimit();

    try {
      const url = new URL(`${this.nominatimBaseUrl}/reverse`);
      url.searchParams.set("lat", String(lat));
      url.searchParams.set("lon", String(lng));
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "RoadWarnings/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Error en Nominatim: ${response.status}`);
      }

      const data: NominatimResult = await response.json();
      return this.parseNominatimResult(data);
    } catch (error) {
      console.error("Error en geocodificación inversa:", error);
      return null;
    }
  }

  /**
   * Obtener sugerencias de búsqueda basadas en historial y ubicación
   */
  getSuggestedSearches(userLocation?: { lat: number; lng: number }): string[] {
    const suggestions = [
      "Restaurantes cerca de mí",
      "Gasolineras",
      "Centros comerciales",
      "Hospitales",
      "Farmacias 24 horas",
      "Bancos y cajeros",
      "Hoteles",
      "Parqueaderos",
    ];

    // Agregar ubicación actual si está disponible
    if (userLocation) {
      suggestions.unshift("Mi ubicación actual");
    }

    return suggestions;
  }

  /**
   * Parsear resultado de Nominatim
   */
  private parseNominatimResult(
    item: NominatimResult,
    userLocation?: { lat: number; lng: number }
  ): PlaceResult {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    let distance: number | undefined;
    if (userLocation) {
      distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      );
    }

    // Determinar tipo de lugar
    let type = PlaceType.ADDRESS;
    if (item.class === "amenity") {
      if (item.type === "restaurant") type = PlaceType.RESTAURANT;
      else if (item.type === "hotel" || item.type === "hostel")
        type = PlaceType.HOTEL;
      else if (item.type === "fuel") type = PlaceType.GAS_STATION;
      else if (item.type === "hospital") type = PlaceType.HOSPITAL;
      else if (item.type === "pharmacy") type = PlaceType.PHARMACY;
      else if (item.type === "bank") type = PlaceType.BANK;
      else if (item.type === "atm") type = PlaceType.ATM;
      else if (item.type === "parking") type = PlaceType.PARKING;
      else if (item.type === "police") type = PlaceType.POLICE;
    } else if (item.class === "shop") {
      type = PlaceType.SHOPPING_MALL;
    } else if (item.class === "tourism") {
      type = PlaceType.LANDMARK;
    }

    return {
      id: String(item.place_id),
      name: item.name || item.address?.road || "Sin nombre",
      displayName: item.display_name,
      address: this.formatAddress(item.address),
      lat,
      lng,
      type,
      category: item.class,
      distance,
    };
  }

  /**
   * Parsear elemento de Overpass API
   */
  private parseOverpassElement(
    element: OverpassElement,
    center: { lat: number; lng: number },
    category: PlaceCategory
  ): PlaceResult | null {
    if (!element.tags?.name) return null;

    const lat = element.lat;
    const lng = element.lon;
    const distance = this.calculateDistance(center.lat, center.lng, lat, lng);

    const address = [
      element.tags["addr:street"],
      element.tags["addr:housenumber"],
      element.tags["addr:city"],
    ]
      .filter(Boolean)
      .join(", ");

    return {
      id: `${element.type}-${element.id}`,
      name: element.tags.name,
      displayName: element.tags.name,
      address: address || "Dirección no disponible",
      lat,
      lng,
      type: this.mapCategoryToType(category.osmValue),
      category: category.osmValue,
      icon: category.icon,
      distance,
    };
  }

  /**
   * Mapear valor OSM a PlaceType
   */
  private mapCategoryToType(osmValue: string): PlaceType {
    const mapping: Record<string, PlaceType> = {
      restaurant: PlaceType.RESTAURANT,
      hotel: PlaceType.HOTEL,
      fuel: PlaceType.GAS_STATION,
      mall: PlaceType.SHOPPING_MALL,
      hospital: PlaceType.HOSPITAL,
      pharmacy: PlaceType.PHARMACY,
      bank: PlaceType.BANK,
      parking: PlaceType.PARKING,
      cafe: PlaceType.RESTAURANT,
      bar: PlaceType.RESTAURANT,
    };

    return mapping[osmValue] || PlaceType.OTHER;
  }

  /**
   * Formatear dirección de Nominatim
   */
  private formatAddress(address: NominatimResult["address"]): string {
    if (!address) return "Dirección no disponible";

    const parts = [
      address.road,
      address.neighbourhood || address.suburb,
      address.city || address.county,
      address.state,
    ].filter(Boolean);

    return parts.join(", ") || "Dirección no disponible";
  }

  /**
   * Calcular distancia entre dos puntos (Haversine)
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Esperar para respetar rate limit de Nominatim (1 req/seg)
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.requestDelay - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Limpiar cache
   */
  clearCache(): void {
    this.searchCache.clear();
  }
}

// Singleton instance
export const geocodingService = new GeocodingService();
