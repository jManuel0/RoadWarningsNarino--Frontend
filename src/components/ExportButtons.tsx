import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Alert } from '@/types/Alert';
import { exportUtils } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ExportButtonsProps {
  alerts: Alert[];
}

export default function ExportButtons({ alerts }: ExportButtonsProps) {
  const handleExportPDF = () => {
    try {
      exportUtils.exportToPDF(alerts);
      toast.success('El PDF se ha descargado correctamente');
    } catch (error) {
      toast.error('No se pudo generar el PDF');
      console.error(error);
    }
  };

  const handleExportExcel = () => {
    try {
      exportUtils.exportToExcel(alerts);
      toast.success('El Excel se ha descargado correctamente');
    } catch (error) {
      toast.error('No se pudo generar el Excel');
      console.error(error);
    }
  };

  const handleExportStats = () => {
    try {
      exportUtils.exportStatsToPDF(alerts);
      toast.success('Las estadísticas se han descargado correctamente');
    } catch (error) {
      toast.error('No se pudo generar el PDF de estadísticas');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md"
        title="Exportar a PDF"
      >
        <FileText size={20} />
        <span className="hidden sm:inline">Exportar PDF</span>
      </button>

      <button
        onClick={handleExportExcel}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"
        title="Exportar a Excel"
      >
        <FileSpreadsheet size={20} />
        <span className="hidden sm:inline">Exportar Excel</span>
      </button>

      <button
        onClick={handleExportStats}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
        title="Exportar Estadísticas"
      >
        <Download size={20} />
        <span className="hidden sm:inline">Estadísticas PDF</span>
      </button>
    </div>
  );
}