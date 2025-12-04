export default {
  generatePDF: async () => {
    try {
      // Filtrar los datos según el dropdown
      const tablaFiltrada = dd_especialidad.selectedOptionValue === "todas"
        ? getEspecialidades.data.map(e => ({
            nombre: e.nombre,
            cantidad: getProfesionales.data.filter(p => p.especialidad_id === e.id).length
          }))
        : getEspecialidades.data
            .filter(e => e.id == dd_especialidad.selectedOptionValue)
            .map(e => ({
              nombre: e.nombre,
              cantidad: getProfesionales.data.filter(p => p.especialidad_id === e.id).length
            }));

      const primaryColor = [119, 181, 37];
      const textColor = [35, 31, 32];
      const grayColor = [113, 110, 110];

      const doc = new jspdf.jsPDF();

      // Título
      doc.setFontSize(24);
      doc.setTextColor(...textColor);
      doc.text('Informe de Especialidades', 105, 20, { align: 'center' });

      // Fecha
      doc.setFontSize(10);
      doc.setTextColor(...grayColor);
      doc.text('Generado el: ' + new Date().toLocaleDateString('es-AR'), 105, 28, { align: 'center' });

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      let yPos = 40;

      // Tabla de Especialidades
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text('Profesionales por Especialidad', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(...textColor);

      if (tablaFiltrada.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.text('Especialidad', 30, yPos);
        doc.text('Cantidad', 140, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');

        tablaFiltrada.forEach(item => {
          doc.text(String(item.nombre || ''), 30, yPos);
          doc.text(String(item.cantidad || 0), 140, yPos);
          yPos += 6;

          if (yPos > 280) { // Si llega al final de la página, agregar página nueva
            doc.addPage();
            yPos = 20;
          }
        });
      } else {
        doc.setTextColor(...grayColor);
        doc.text('No hay datos disponibles', 30, yPos);
      }

      // Footer con número de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...grayColor);
        doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' });
        doc.text('TurnoVital - Sistema de Gestión de Turnos', 105, 292, { align: 'center' });
      }

      const fileName = 'Informe_Especialidades_' + new Date().toISOString().split('T')[0] + '.pdf';
      const pdfBase64 = doc.output('datauristring');
      download(pdfBase64, fileName, 'application/pdf');

      showAlert('PDF generado exitosamente', 'success');
      return { success: true };

    } catch (error) {
      console.error('❌ ERROR:', error);
      showAlert('Error al generar el PDF: ' + error.message, 'error');
      return { success: false, error: error.message };
    }
  }
}
