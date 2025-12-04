export default {
  generateReporteTurnosPDF: async () => {
    try {
      // 1️⃣ Filtrar y agrupar los turnos según DatePickers
      const turnosFiltrados = getTurnos.data
        .map(turnoItem => {
          const profesional = getProfesionales.data.find(p => p.id === turnoItem.profesional_id);
          const especialidad = getEspecialidades.data.find(e => e.id === profesional?.especialidad_id);
          return { ...turnoItem, especialidadNombre: especialidad?.nombre || "Sin especialidad" };
        })
        .filter(t => {
          const start = new Date(startDatePicker.selectedDate);
          const end = new Date(endDatePicker.selectedDate);
          const turnoFecha = new Date(t.fecha);
          return turnoFecha >= start && turnoFecha <= end;
        })
        .reduce((acc, t) => {
          const index = acc.findIndex(e => e.especialidad === t.especialidadNombre);
          if(index >= 0){ acc[index].totalTurnos += 1; }
          else { acc.push({ especialidad: t.especialidadNombre, totalTurnos: 1 }); }
          return acc;
        }, []);

      if(turnosFiltrados.length === 0){
        showAlert('No existen registros para los filtros seleccionados', 'info');
        return { success: false, error: 'Sin datos para generar PDF' };
      }

      // 2️⃣ Crear PDF
      const doc = new jspdf.jsPDF();

      // Título y fecha
      doc.setFontSize(20);
      doc.text('Reporte de Turnos por Especialidad', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Fecha de emisión: ' + new Date().toLocaleDateString('es-AR'), 105, 28, { align: 'center' });

      doc.setDrawColor(119, 181, 37);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      // 3️⃣ Tabla de resultados
      let yPos = 40;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Especialidad', 30, yPos);
      doc.text('Cantidad de Turnos', 140, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 6;

      turnosFiltrados.forEach(item => {
        doc.text(item.especialidad, 30, yPos);
        doc.text(String(item.totalTurnos), 140, yPos);
        yPos += 6;
        if(yPos > 200){ doc.addPage(); yPos = 20; }
      });

      yPos += 10;

      // 4️⃣ Gráfico de torta simulado con barras
      const totalTurnos = turnosFiltrados.reduce((sum, t) => sum + t.totalTurnos, 0);
      const colors = ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#8BC34A','#00BCD4','#FF5722'];
      let barY = yPos;

      turnosFiltrados.forEach((item, i) => {
        const width = (item.totalTurnos / totalTurnos) * 150; // ancho proporcional
        doc.setFillColor(colors[i % colors.length]);
        doc.rect(30, barY, width, 15, 'F'); // dibuja barra
        doc.setTextColor(0, 0, 0);
        doc.text(`${item.especialidad} (${((item.totalTurnos/totalTurnos)*100).toFixed(1)}%)`, 30 + 2, barY + 10);
        barY += 20;
        if(barY > 250){ doc.addPage(); barY = 20; }
      });

      // 5️⃣ Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i=1; i<=pageCount; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' });
        doc.text('TurnoVital - Sistema de Gestión de Turnos', 105, 292, { align: 'center' });
      }

      // 6️⃣ Descargar PDF
      const fileName = 'Reporte_Turnos_' + new Date().toISOString().split('T')[0] + '.pdf';
      download(doc.output('datauristring'), fileName, 'application/pdf');

      showAlert('PDF generado exitosamente', 'success');
      return { success: true };

    } catch(error){
      console.error(error);
      showAlert('Error al generar el PDF: ' + error.message, 'error');
      return { success: false, error: error.message };
    }
  }
}
