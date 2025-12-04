export default {
  generateReporteProfesionales: async () => {
    try {
      const especialidadSeleccionada = dd_especialidad.selectedOptionValue || 'todas';

      // 1️⃣ Filtrar profesionales según el dropdown
      const profesionalesFiltrados = getProfesionales.data.filter(p =>
        especialidadSeleccionada === 'todas' || p.especialidad_id == especialidadSeleccionada
      );

      // 2️⃣ Resumen por especialidad
      const resumenPorEspecialidad = getEspecialidades.data
        .filter(e => especialidadSeleccionada === 'todas' || e.id == especialidadSeleccionada)
        .map(e => {
          const cantidad = profesionalesFiltrados.filter(p => p.especialidad_id === e.id).length;
          return { nombre: e.nombre, cantidad };
        })
        .filter(r => r.cantidad > 0); // solo mostrar especialidades con profesionales

      if (resumenPorEspecialidad.length === 0) {
        showAlert('No existen registros para los filtros seleccionados', 'info');
        return { success: false, error: 'Sin datos para generar PDF' };
      }

      const primaryColor = [119, 181, 37];
      const textColor = [35, 31, 32];
      const grayColor = [113, 110, 110];

      // 3️⃣ Crear PDF
      const doc = new jspdf.jsPDF();

      // Título
      doc.setFontSize(20);
      doc.setTextColor(...textColor);
      doc.text('Reporte de Profesionales por Especialidad', 105, 20, { align: 'center' });

      // Fecha
      doc.setFontSize(10);
      doc.setTextColor(...grayColor);
      doc.text('Fecha de emisión: ' + new Date().toLocaleDateString('es-AR'), 105, 28, { align: 'center' });

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      let yPos = 40;

      // 4️⃣ Tabla de resultados
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('Tabla de profesionales por especialidad', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.setFont(undefined, 'bold');
      doc.text('Especialidad', 30, yPos);
      doc.text('Cantidad de Profesionales', 140, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 6;

      resumenPorEspecialidad.forEach(item => {
        doc.text(String(item.nombre || ''), 30, yPos);
        doc.text(String(item.cantidad || 0), 140, yPos);
        yPos += 6;
        if (yPos > 200) { doc.addPage(); yPos = 20; }
      });

      yPos += 10;

      // 5️⃣ Gráfico de torta simulado con barras
      const totalProfesionales = resumenPorEspecialidad.reduce((acc, r) => acc + r.cantidad, 0);
      const colors = ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#8BC34A','#00BCD4','#FF5722'];
      let barY = yPos;

      resumenPorEspecialidad.forEach((item, i) => {
        const width = (item.cantidad / totalProfesionales) * 150; // ancho proporcional al porcentaje
        doc.setFillColor(colors[i % colors.length]);
        doc.rect(30, barY, width, 15, 'F'); // dibuja barra
        doc.setTextColor(0, 0, 0);
        doc.text(`${item.nombre} (${((item.cantidad / totalProfesionales) * 100).toFixed(1)}%)`, 30 + 2, barY + 10);
        barY += 20;
        if(barY > 250) { doc.addPage(); barY = 20; }
      });

      // 6️⃣ Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...grayColor);
        doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' });
        doc.text('TurnoVital - Sistema de Gestión de Turnos', 105, 292, { align: 'center' });
      }

      // 7️⃣ Descargar PDF
      const fileName = 'Reporte_Profesionales_' + new Date().toISOString().split('T')[0] + '.pdf';
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
