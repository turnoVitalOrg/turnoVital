export default {
  downloadAgendaPDF: async () => {
    try {
      // Obtenemos los cambios directamente del motor de lógica
      const cambios = configurarAgenda.getDetalleCambios();

      if (!cambios || cambios.length === 0) {
        showAlert("No hay cambios pendientes para exportar", "warning");
        return;
      }

      // Supongamos que loadInitialData tiene la info del profesional
      const nombreProfesional = loadInitialData.persona?.nombre ?? "Profesional";
      const apellidoProfesional = loadInitialData.persona?.apellido ?? "";

      await this.generatePDF(
        cambios,
        nombreProfesional,
        apellidoProfesional
      );

    } catch (e) {
      console.error("Error al generar PDF:", e);
      showAlert("Error al generar PDF: " + e.message, "error");
    }
  },

  generatePDF: async (cambiosData, nombreProfesional, apellidoProfesional) => {
    const doc = new jspdf.jsPDF();

    const formatearHora = (hora) => {
      if (!hora) return "--:--";
      return hora.split(":").slice(0, 2).join(":");
    };

    const primary = [119, 181, 37]; // Verde TurnoVital
    const text = [35, 31, 32];
    const gray = [113, 110, 110];

    // ENCABEZADO
    doc.setFontSize(22);
    doc.setTextColor(...text);
    doc.text("Reporte de Cambios en Agenda", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(...primary);
    doc.text(`${nombreProfesional} ${apellidoProfesional}`, 105, 28, { align: "center" });

    const fecha = new Date().toLocaleString("es-AR");
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(`Generado el: ${fecha}`, 105, 34, { align: "center" });

    doc.setDrawColor(...primary);
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);

    let y = 50;

    const imprimirEncabezadoTabla = (posY) => {
      doc.setFontSize(11);
      doc.setTextColor(...text);
      doc.setFont(undefined, "bold");
      doc.text("ACCIÓN", 20, posY);
      doc.text("DÍA", 50, posY);
      doc.text("INICIO", 100, posY);
      doc.text("FIN", 140, posY);
      doc.line(20, posY + 2, 190, posY + 2);
      return posY + 8;
    };

    y = imprimirEncabezadoTabla(y);

    cambiosData.forEach(cambio => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        y = imprimirEncabezadoTabla(y);
      }

      const row = cambio.data;
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
      
      // Estilo según tipo de cambio
      if(cambio.tipo === 'nuevo') doc.setTextColor(0, 150, 0);
      else if(cambio.tipo === 'eliminado') doc.setTextColor(200, 0, 0);
      else doc.setTextColor(...text);

      doc.text(cambio.tipo.toUpperCase(), 20, y);
      doc.setTextColor(...text); // Reset color para el resto de la fila
      doc.text(row.dia_semana || row.dia || "N/A", 50, y);
      doc.text(formatearHora(row.hora_inicio), 100, y);
      doc.text(formatearHora(row.hora_fin), 140, y);

      y += 7;
    });

    // Pie de página
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...gray);
      doc.text(`Página ${i} de ${pages}`, 105, 287, { align: "center" });
      doc.text("TurnoVital - Sistema de Gestión de Agendas", 105, 292, { align: "center" });
    }

    const fechaArchivo = new Date().toISOString().split("T")[0];
    const fileName = `Cambios_${apellidoProfesional}_${fechaArchivo}.pdf`;

    const pdfData = doc.output("datauristring");
    download(pdfData, fileName, "application/pdf");
  }
};