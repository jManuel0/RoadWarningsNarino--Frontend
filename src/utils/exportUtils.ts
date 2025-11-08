import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
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
  exportToExcel: async (alerts: Alert[], filename = 'reporte-alertas.xlsx') => {
    const workbook = new ExcelJS.Workbook();

    // Hoja de Alertas
    const worksheet = workbook.addWorksheet('Alertas');

    // Definir columnas
    worksheet.columns = [
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Prioridad', key: 'prioridad', width: 12 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Ubicación', key: 'ubicacion', width: 35 },
      { header: 'Latitud', key: 'latitud', width: 10 },
      { header: 'Longitud', key: 'longitud', width: 10 },
      { header: 'Vías Afectadas', key: 'vias', width: 30 },
      { header: 'Fecha y Hora', key: 'fecha', width: 18 },
      { header: 'Duración Estimada (min)', key: 'duracion', width: 20 },
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Agregar datos
    for (const alert of alerts) {
      worksheet.addRow({
        tipo: typeNames[alert.type],
        prioridad: priorityNames[alert.priority],
        estado: statusNames[alert.status],
        descripcion: alert.description,
        ubicacion: alert.location.address,
        latitud: alert.location.lat,
        longitud: alert.location.lng,
        vias: alert.affectedRoads.join(', '),
        fecha: format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm'),
        duracion: alert.estimatedDuration || 'N/A',
      });
    }

    // Hoja de Estadísticas
    const statsWorksheet = workbook.addWorksheet('Estadísticas');

    statsWorksheet.columns = [
      { width: 30 },
      { width: 15 },
    ];

    // Agregar estadísticas
    statsWorksheet.addRow(['Estadísticas Generales']).font = { bold: true, size: 14 };
    statsWorksheet.addRow([]);
    statsWorksheet.addRow(['Total de Alertas', alerts.length]);
    statsWorksheet.addRow(['Alertas Activas', alerts.filter(a => a.status === AlertStatus.ACTIVE).length]);
    statsWorksheet.addRow(['Alertas Críticas', alerts.filter(a => a.priority === AlertPriority.CRITICA).length]);
    statsWorksheet.addRow(['Alertas Resueltas', alerts.filter(a => a.status === AlertStatus.RESOLVED).length]);
    statsWorksheet.addRow([]);
    statsWorksheet.addRow(['Por Tipo']).font = { bold: true, size: 12 };
    statsWorksheet.addRow(['Derrumbes', alerts.filter(a => a.type === AlertType.DERRUMBE).length]);
    statsWorksheet.addRow(['Accidentes', alerts.filter(a => a.type === AlertType.ACCIDENTE).length]);
    statsWorksheet.addRow(['Inundaciones', alerts.filter(a => a.type === AlertType.INUNDACION).length]);
    statsWorksheet.addRow(['Cierres Viales', alerts.filter(a => a.type === AlertType.CIERRE_VIAL).length]);
    statsWorksheet.addRow(['Mantenimiento', alerts.filter(a => a.type === AlertType.MANTENIMIENTO).length]);

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = globalThis.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    globalThis.URL.revokeObjectURL(url);
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
    
    for (const [label, value] of stats) {
      doc.text(label, 14, yPosition);
      doc.text(value, 100, yPosition);
      yPosition += 7;
    }
    
    yPosition += 10;
    
    // Por tipo
    doc.setFontSize(14);
    doc.text('Distribución por Tipo', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    for (const [type, name] of Object.entries(typeNames)) {
      const count = alerts.filter(a => a.type === type).length;
      doc.text(name + ':', 14, yPosition);
      doc.text(count.toString(), 100, yPosition);
      yPosition += 7;
    }
    
    // Guardar
    doc.save(filename);
  },
};