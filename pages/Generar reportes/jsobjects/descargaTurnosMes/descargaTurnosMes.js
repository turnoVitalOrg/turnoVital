export default {
  exportPDF: async () => {
    try {
      const mesesArray = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

      // Rango de meses
      const [nombreMesDesde, anioDesdeStr] = dd_mesDesde.selectedOptionValue.split(" ");
      const mesDesde = mesesArray.indexOf(nombreMesDesde);
      const anioDesde = parseInt(anioDesdeStr);

      const [nombreMesHasta, anioHastaStr] = dd_mesHasta.selectedOptionValue.split(" ");
      const mesHasta = mesesArray.indexOf(nombreMesHasta);
      const anioHasta = parseInt(anioHastaStr);

      const estado = dd_estado2.selectedOptionValue;

      // Filtrar turnos por rango de meses
      let turnosFiltrados = getTurnos.data.filter(t => {
        const fechaTurno = new Date(t.fecha);
        const mes = fechaTurno.getMonth();
        const anio = fechaTurno.getFullYear();
        const desdeNum = anioDesde*12 + mesDesde;
        const hastaNum = anioHasta*12 + mesHasta;
        const actualNum = anio*12 + mes;
        return actualNum >= desdeNum && actualNum <= hastaNum;
      });

      // Generar tabla por mes
      const tabla = [];
      for (let y = anioDesde; y <= anioHasta; y++) {
        const mesIni = y === anioDesde ? mesDesde : 0;
        const mesFin = y === anioHasta ? mesHasta : 11;

        for (let m = mesIni; m <= mesFin; m++) {
          const mesTexto = `${mesesArray[m]} ${y}`;
          const turnosMes = turnosFiltrados.filter(t => {
            const fechaTurno = new Date(t.fecha);
            return fechaTurno.getMonth() === m && fechaTurno.getFullYear() === y;
          });

          let total = 0;
          if (estado === "Asistidos") total = turnosMes.filter(t => t.estado === true).length;
          else if (estado === "No Asistidos") total = turnosMes.filter(t => t.estado === false).length;
          else total = turnosMes.length; // Todos

          tabla.push({ "Mes": mesTexto, "Total": total });
        }
      }

      // Si no hay datos, mostrar alerta y salir
      const totalGeneral = tabla.reduce((acc, t) => acc + t.Total, 0);
      if(totalGeneral === 0){
        showAlert("No hay registros para el rango y estado seleccionados. PDF no generado.", "info");
        return;
      }

      // ----- Generar PDF -----
      const doc = new jspdf.jsPDF();
      const textColor = [35,31,32];
      const grayColor = [113,110,110];
      const primaryColor = [119,181,37];

      // Título
      doc.setFontSize(20);
      doc.setTextColor(...textColor);
      doc.text('Reporte Mensual de Turnos', 105, 20, { align: 'center' });

      // Fecha
      doc.setFontSize(10);
      doc.setTextColor(...grayColor);
      doc.text('Fecha de emisión: ' + new Date().toLocaleDateString('es-AR'), 105, 28, { align: 'center' });

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      let yPos = 40;

      // Tabla
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('Tabla de resultados', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.setFont(undefined, 'bold');
      doc.text('Mes', 30, yPos);
      doc.text('Total', 140, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');

      tabla.forEach(item => {
        doc.text(item.Mes, 30, yPos);
        doc.text(String(item.Total), 140, yPos);
        yPos += 6;
        if(yPos > 250){ doc.addPage(); yPos = 20; }
      });

      yPos += 10;

      // Mostrar filtro de estado
      doc.setFontSize(12);
      doc.setTextColor(...textColor);
      doc.text(`Estado de turnos: ${estado}`, 30, yPos);
      yPos += 8;

      // --- Gráfico de barras horizontales ---
      const maxTotal = Math.max(...tabla.map(t => t.Total), 1);
      const barHeight = 8;
      const barMaxWidth = 120;

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.text('Gráfico de barras de turnos', 105, yPos, { align: 'center' });
      yPos += 10;

      tabla.forEach(item => {
        const barWidth = (item.Total / maxTotal) * barMaxWidth;

        doc.setFillColor(...primaryColor);
        doc.rect(30, yPos - barHeight + 2, barWidth, barHeight, 'F');

        doc.setFont(undefined, 'bold');
        doc.text(String(item.Total), 32 + barWidth, yPos);

        doc.setFont(undefined, 'normal');
        doc.text(item.Mes, 30, yPos - barHeight);

        yPos += barHeight + 10;
        if(yPos > 250){ doc.addPage(); yPos = 20; }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...grayColor);
        doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' });
        doc.text('TurnoVital - Sistema de Gestión de Turnos', 105, 292, { align: 'center' });
      }

      const fileName = 'Reporte_Mensual_Turnos_' + new Date().toISOString().split('T')[0] + '.pdf';
      const pdfBase64 = doc.output('datauristring');
      download(pdfBase64, fileName, 'application/pdf');

      showAlert('PDF generado exitosamente', 'success');

    } catch (error) {
      console.error(error);
      showAlert('Error al generar PDF: ' + error.message, 'error');
    }
  }
}
