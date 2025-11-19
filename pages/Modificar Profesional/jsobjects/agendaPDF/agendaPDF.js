export default {
  downloadAgendaPDF: async () => {
    try {
      // Filtra la agenda por el profesional actual según el id de la URL
      const agendaFiltrada = configurarAgenda.agenda.filter(
        item => item.profesional_id === appsmith.URL.queryParams.id
      );

      if (!agendaFiltrada || agendaFiltrada.length === 0) {
        showAlert("No hay datos de agenda para este profesional", "warning");
        return;
      }

      // Obtener nombre y apellido del profesional
      const nombreProfesional = loadInitialData.persona?.nombre ?? "";
      const apellidoProfesional = loadInitialData.persona?.apellido ?? "";

      // Genera el PDF con formato profesional y nombre del profesional
      await agendaPDF.generatePDF(agendaFiltrada, nombreProfesional, apellidoProfesional);

      showAlert("PDF generado correctamente", "success");
    } catch (error) {
      console.error("Error generando PDF:", error);
      showAlert("Error al generar PDF: " + error.message, "error");
    }
  },

  generatePDF: async (agendaData, nombreProfesional, apellidoProfesional) => {
    const doc = new jspdf.jsPDF();

    const primaryColor = [119, 181, 37];
    const textColor = [35, 31, 32];
    const grayColor = [113, 110, 110];

    // Encabezado
    doc.setFontSize(24);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Detalle de Agenda del Profesional:", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${nombreProfesional} ${apellidoProfesional}`, 105, 28, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    const fecha = new Date().toLocaleDateString("es-AR");
    doc.text("Generado el: " + fecha, 105, 34, { align: "center" });

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);

    let yPos = 46;

    // Tabla de agenda
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Horarios", 20, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, "bold");
    doc.text("Día de la semana", 20, yPos);
    doc.text("Hora inicio", 80, yPos);
    doc.text("Hora fin", 130, yPos);
    yPos += 6;
    doc.setFont(undefined, "normal");

    agendaData.forEach((item) => {
      doc.text(item.dia_semana || "", 20, yPos);
      doc.text(item.hora_inicio || "", 80, yPos);
      doc.text(item.hora_fin || "", 130, yPos);
      yPos += 6;

      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
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

    const fileName = `Agenda_${nombreProfesional}_${apellidoProfesional}_${new Date().toISOString().split("T")[0]}.pdf`;
    const pdfBase64 = doc.output("datauristring");
    download(pdfBase64, fileName, "application/pdf");
  }
};
