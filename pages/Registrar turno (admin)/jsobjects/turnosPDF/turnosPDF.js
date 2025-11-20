export default {
  generarPDF: async () => {
    try {
      const turnos = mostrarTurnos2.data;

      if (!turnos || turnos.length === 0) {
        showAlert("No hay turnos reservados.", "warning");
        return;
      }

      const doc = new jspdf.jsPDF();
      const primaryColor = [119, 181, 37];
      const textColor = [35, 31, 32];
      const grayColor = [113, 110, 110];

      let y = 15;

      // Título
      doc.setFontSize(18);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("Informe de Turnos Reservados", 105, y, { align: "center" });
      y += 12;

      // Encabezados
      doc.setFontSize(12);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Fecha", 10, y);
      doc.text("Hora", 40, y);
      doc.text("Paciente", 70, y);
      doc.text("Profesional", 130, y);
      y += 6;

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(10, y, 200, y);
      y += 8;

      // Datos
      doc.setFontSize(11);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      turnos.forEach(t => {
        doc.text(String(t.fecha || ""), 10, y);
        doc.text(String(t.hora || ""), 40, y);
        doc.text(String(t.paciente_nombre || ""), 70, y);
        doc.text(String(t.profesional_nombre || ""), 130, y);

        y += 8;
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
      });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text("Página " + i + " de " + pageCount, 105, 287, { align: "center" });
        doc.text("TurnoVital - Sistema de Gestión de Turnos", 105, 292, { align: "center" });
      }

      // Descargar PDF usando Appsmith
      const fileName = `Turnos_${new Date().toISOString().split("T")[0]}.pdf`;
      const pdfBase64 = doc.output("datauristring");
      download(pdfBase64, fileName, "application/pdf");

      showAlert("PDF generado y descargado correctamente", "success");

    } catch (e) {
      console.error("Error PDF:", e);
      showAlert("Error al generar PDF", "error");
    }
  }
};
