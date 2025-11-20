import { renderHook, act } from "@testing-library/react";
import { AlertType, AlertSeverity, AlertStatus } from "@/types/Alert";
import * as filterStoreModule from "./filterStore";

const loadFilterStore = () => filterStoreModule;

describe("filterStore", () => {
  let useFilterStore: ReturnType<typeof loadFilterStore>["useFilterStore"];
  const resetStore = () => {
    jest.resetModules();
    useFilterStore = loadFilterStore().useFilterStore;
  };

  beforeEach(() => {
    resetStore();
    const { result } = renderHook(() => useFilterStore());
    act(() => {
      result.current.clearFilters();
    });
    localStorage.clear();
  });

  it("initializes with empty filters", () => {
    const { result } = renderHook(() => useFilterStore());

    expect(result.current.filters.types).toEqual([]);
    expect(result.current.filters.severities).toEqual([]);
    expect(result.current.filters.statuses).toEqual([]);
    expect(result.current.filters.dateFrom).toBe("");
    expect(result.current.filters.dateTo).toBe("");
    expect(result.current.filters.municipality).toBe("");
  });

  it("sets filters correctly", () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.setFilters({
        municipality: "Pasto",
        dateFrom: "2024-01-01",
      });
    });

    expect(result.current.filters.municipality).toBe("Pasto");
    expect(result.current.filters.dateFrom).toBe("2024-01-01");
  });

  it("toggles type filter on/off", () => {
    const { result } = renderHook(() => useFilterStore());

    // Toggle on
    act(() => {
      result.current.toggleType(AlertType.ACCIDENTE);
    });

    expect(result.current.filters.types).toContain(AlertType.ACCIDENTE);

    // Toggle off
    act(() => {
      result.current.toggleType(AlertType.ACCIDENTE);
    });

    expect(result.current.filters.types).not.toContain(AlertType.ACCIDENTE);
  });

  it("toggles multiple types", () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.toggleType(AlertType.ACCIDENTE);
      result.current.toggleType(AlertType.DERRUMBE);
    });

    expect(result.current.filters.types).toHaveLength(2);
    expect(result.current.filters.types).toContain(AlertType.ACCIDENTE);
    expect(result.current.filters.types).toContain(AlertType.DERRUMBE);
  });

  it("toggles severity filter on/off", () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.toggleSeverity(AlertSeverity.CRITICA);
    });

    expect(result.current.filters.severities).toContain(AlertSeverity.CRITICA);

    act(() => {
      result.current.toggleSeverity(AlertSeverity.CRITICA);
    });

    expect(result.current.filters.severities).not.toContain(
      AlertSeverity.CRITICA
    );
  });

  it("toggles status filter on/off", () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.toggleStatus(AlertStatus.ACTIVE);
    });

    expect(result.current.filters.statuses).toContain(AlertStatus.ACTIVE);

    act(() => {
      result.current.toggleStatus(AlertStatus.ACTIVE);
    });

    expect(result.current.filters.statuses).not.toContain(AlertStatus.ACTIVE);
  });

  it("clears all filters", () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.setFilters({
        municipality: "Pasto",
        dateFrom: "2024-01-01",
      });
      result.current.toggleType(AlertType.ACCIDENTE);
      result.current.toggleSeverity(AlertSeverity.ALTA);
    });

    expect(result.current.filters.municipality).toBe("Pasto");
    expect(result.current.filters.types).toHaveLength(1);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.municipality).toBe("");
    expect(result.current.filters.dateFrom).toBe("");
    expect(result.current.filters.types).toEqual([]);
    expect(result.current.filters.severities).toEqual([]);
  });

  it("persists filters to localStorage", () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.setFilters({ municipality: "Pasto" });
    });

    const stored = localStorage.getItem("filter-storage");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.filters.municipality).toBe("Pasto");
  });

  it("loads filters from localStorage on initialization", () => {
    localStorage.setItem(
      "filter-storage",
      JSON.stringify({
        state: {
          filters: {
            types: [AlertType.ACCIDENTE],
            severities: [AlertSeverity.ALTA],
            statuses: [],
            dateFrom: "2024-01-01",
            dateTo: "",
            municipality: "Pasto",
          },
        },
        version: 0,
      })
    );

    resetStore();
    const { result } = renderHook(() => useFilterStore());

    expect(result.current.filters.types).toContain(AlertType.ACCIDENTE);
    expect(result.current.filters.severities).toContain(AlertSeverity.ALTA);
    expect(result.current.filters.municipality).toBe("Pasto");
    expect(result.current.filters.dateFrom).toBe("2024-01-01");
  });

  it("merges partial filter updates without losing existing values", () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.setFilters({ municipality: "Pasto" });
    });

    act(() => {
      result.current.setFilters({ dateFrom: "2024-01-01" });
    });

    expect(result.current.filters.municipality).toBe("Pasto");
    expect(result.current.filters.dateFrom).toBe("2024-01-01");
  });
});
