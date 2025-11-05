import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Alert, AlertType, AlertPriority, AlertStatus } from '@/types/Alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mapeos para nombres legibles
const typeNames = {
  [AlertType.DERRUMBE]: 'Derrumbe',
  [AlertType.ACCIDENTE]: 'Accidente',
  [AlertType.INUNDACION]: 'Inundación',
  [AlertType.CIERRE_VIAL]: 'Cierre Vial',
  [AlertType.MANTENIMIENTO]: 'Mantenimiento',
};

const priorityNames = {
  [AlertPriority.CRITICA]: 'Crítica',
  [AlertPriority.ALTA]: 'Alta',
  [AlertPriority.MEDIA]: 'Media',
  [AlertPriority.BAJA]: 'Baja',
};

const statusNames = {
  [AlertStatus.ACTIVE]: 'Activa',
  [AlertStatus.IN_PROGRESS]: 'En Progreso',
  [AlertStatus.RESOLVED]: 'Resuelta',
};

export const exportUtils = {
  // Exportar a PDF
  exportToPDF: (alerts: Alert[], filename = 'reporte-alertas.pdf') => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Alertas Viales', 14, 20);
    
    // Fecha del reporte
    doc.setFontSize(11);
    doc.text(
      `Generado: ${format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}`,
      14,
      28
    );
    
    // Estadísticas generales
    const stats = {
      total: alerts.length,
      activas: alerts.filter(a => a.status === AlertStatus.ACTIVE).length,
      criticas: alerts.filter(a => a.priority === AlertPriority.CRITICA).length,
      resueltas: alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
    };
    
    doc.setFontSize(10);
    doc.text(`Total de Alertas: ${stats.total}`, 14, 36);
    doc.text(`Activas: ${stats.activas} | Críticas: ${stats.criticas} | Resueltas: ${stats.resueltas}`, 14, 42);
    
    // Tabla de alertas
    const tableData = alerts.map(alert => [
      typeNames[alert.type],
      priorityNames[alert.priority],
      statusNames[alert.status],
      alert.location.address,
      format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm'),
      alert.estimatedDuration ? `${alert.estimatedDuration} min` : 'N/A',
    ]);
    
    autoTable(doc, {
      startY: 50,
      head: [['Tipo', 'Prioridad', 'Estado', 'Ubicación', 'Fecha', 'Duración']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 22 },
        3: { cellWidth: 60 },
        4: { cellWidth: 30 },
        5: { cellWidth: 20 },
      },
    });
    
    // Guardar PDF
    doc.save(filename);
  },

  // Exportar a Excel
  exportToExcel: (alerts: Alert[], filename = 'reporte-alertas.xlsx') => {
    const data = alerts.map(alert => ({
      'Tipo': typeNames[alert.type],
      'Prioridad': priorityNames[alert.priority],
      'Estado': statusNames[alert.status],
      'Descripción': alert.description,
      'Ubicación': alert.location.address,
      'Latitud': alert.location.lat,
      'Longitud': alert.location.lng,
      'Vías Afectadas': alert.affectedRoads.join(', '),
      'Fecha y Hora': format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm'),
      'Duración Estimada (min)': alert.estimatedDuration || 'N/A',
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 15 }, // Tipo
      { wch: 12 }, // Prioridad
      { wch: 12 }, // Estado
      { wch: 40 }, // Descripción
      { wch: 35 }, // Ubicación
      { wch: 10 }, // Latitud
      { wch: 10 }, // Longitud
      { wch: 30 }, // Vías Afectadas
      { wch: 18 }, // Fecha y Hora
      { wch: 20 }, // Duración
    ];
    ws['!cols'] = columnWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alertas');
    
    // Agregar hoja de estadísticas
    const stats = [
      ['Estadísticas Generales'],
      [''],
      ['Total de Alertas', alerts.length],
      ['Alertas Activas', alerts.filter(a => a.status === AlertStatus.ACTIVE).length],
      ['Alertas Críticas', alerts.filter(a => a.priority === AlertPriority.CRITICA).length],
      ['Alertas Resueltas', alerts.filter(a => a.status === AlertStatus.RESOLVED).length],
      [''],
      ['Por Tipo'],
      ['Derrumbes', alerts.filter(a => a.type === AlertType.DERRUMBE).length],
      ['Accidentes', alerts.filter(a => a.type === AlertType.ACCIDENTE).length],
      ['Inundaciones', alerts.filter(a => a.type === AlertType.INUNDACION).length],
      ['Cierres Viales', alerts.filter(a => a.type === AlertType.CIERRE_VIAL).length],
      ['Mantenimiento', alerts.filter(a => a.type === AlertType.MANTENIMIENTO).length],
    ];
    
    const wsStats = XLSX.utils.aoa_to_sheet(stats);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');
    
    // Guardar Excel
    XLSX.writeFile(wb, filename);
  },

  // Exportar resumen estadístico a PDF
  exportStatsToPDF: (alerts: Alert[], filename = 'estadisticas-alertas.pdf') => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Estadísticas de Alertas Viales', 14, 20);
    
    // Fecha
    doc.setFontSize(11);
    doc.text(
      `Período: ${format(new Date(), "MMMM 'de' yyyy", { locale: es })}`,
      14,
      28
    );
    
    let yPosition = 45;
    
    // Estadísticas generales
    doc.setFontSize(14);
    doc.text('Resumen General', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    const stats = [
      ['Total de Alertas:', alerts.length.toString()],
      ['Activas:', alerts.filter(a => a.status === AlertStatus.ACTIVE).length.toString()],
      ['En Progreso:', alerts.filter(a => a.status === AlertStatus.IN_PROGRESS).length.toString()],
      ['Resueltas:', alerts.filter(a => a.status === AlertStatus.RESOLVED).length.toString()],
      ['Críticas:', alerts.filter(a => a.priority === AlertPriority.CRITICA).length.toString()],
    ];
    
    stats.forEach(([label, value]) => {
      doc.text(label, 14, yPosition);
      doc.text(value, 100, yPosition);
      yPosition += 7;
    });
    
    yPosition += 10;
    
    // Por tipo
    doc.setFontSize(14);
    doc.text('Distribución por Tipo', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    Object.entries(typeNames).forEach(([type, name]) => {
      const count = alerts.filter(a => a.type === type).length;
      doc.text(name + ':', 14, yPosition);
      doc.text(count.toString(), 100, yPosition);
      yPosition += 7;
    });
    
    // Guardar
    doc.save(filename);
  },
};