// src/components/FloatingClearFilters.tsx
import { FilterX } from "lucide-react";
import { useFilterStore } from "@/stores/filterStore";
import { toast } from "sonner";

export default function FloatingClearFilters() {
  const { filters, clearFilters } = useFilterStore();

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.severities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.municipality.trim();

  if (!hasActiveFilters) return null;

  const handleClear = () => {
    clearFilters();
    toast.success("Filtros limpiados", {
      description: "Todos los filtros han sido eliminados",
    });
  };

  const activeFiltersCount = [
    filters.types.length,
    filters.severities.length,
    filters.statuses.length,
    filters.dateFrom ? 1 : 0,
    filters.dateTo ? 1 : 0,
    filters.municipality ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <button
      onClick={handleClear}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      title="Limpiar todos los filtros"
    >
      <FilterX size={20} />
      <span className="font-medium">Limpiar Filtros</span>
      <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
        {activeFiltersCount}
      </span>
    </button>
  );
}
