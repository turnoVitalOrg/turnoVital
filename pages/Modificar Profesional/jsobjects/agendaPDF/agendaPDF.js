export default {
  downloadAgendaPDF: async () => {
    try {
      const agenda = configurarAgenda.agenda;

      if (!agenda || agenda.length === 0) {
        showAlert("No hay datos de agenda para este profesional", "warning");
        return;
      }

      const nombreProfesional = loadInitialData.persona?.nombre ?? "";
      const apellidoProfesional = loadInitialData.persona?.apellido ?? "";

      await agendaPDF.generatePDF(agenda, nombreProfesional, apellidoProfesional);

    } catch (e) {
      console.error("Error al generar PDF:", e);
      showAlert("Error al generar PDF", "error");
    }
  },

  generatePDF: async (agendaData, nombreProfesional, apellidoProfesional) => {
    const doc = new jspdf.jsPDF();

    // Colores usados (mismos que Informe Turnos)
    const primary = [119, 181, 37]; 
    const text = [35, 31, 32];
    const gray = [113, 110, 110];

    // ---- ENCABEZADO ----
    doc.setFontSize(24);
    doc.setTextColor(...text);
    doc.text("Agenda del Profesional", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(...primary);
    doc.text(`${nombreProfesional} ${apellidoProfesional}`, 105, 28, { align: "center" });

    // Fecha
    const fecha = new Date().toLocaleDateString("es-AR");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text(`Generado el ${fecha}`, 105, 34, { align: "center" });

    // Línea separadora
    doc.setDrawColor(...primary);
    doc.setLineWidth(0.7);
    doc.line(20, 38, 190, 38);

    // ---- TABLA ----
    let y = 50;

    doc.setFontSize(16);
    doc.setTextColor(...primary);
    doc.text("Horarios", 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(...text);
    doc.setFont(undefined, "bold");

    doc.text("Día", 20, y);
    doc.text("Inicio", 80, y);
    doc.text("Fin", 130, y);

    y += 7;
    doc.setFont(undefined, "normal");

    agendaData.forEach(item => {
      doc.text(item.dia_semana || item.dia || "", 20, y);
      doc.text(item.hora_inicio || "", 80, y);
      doc.text(item.hora_fin || "", 130, y);

      y += 7;

      // Agregar nueva página si se llena
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    // ---- FOOTER ----
    const pages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...gray);

      doc.text(`Página ${i} de ${pages}`, 105, 287, { align: "center" });
      doc.text("TurnoVital - Sistema de Gestión de Turnos", 105, 293, { align: "center" });
    }

    // Guardar archivo
    const fileName = `Agenda_${nombreProfesional}_${apellidoProfesional}_${new Date().toISOString().split("T")[0]}.pdf`;
    const pdfData = doc.output("datauristring");
    download(pdfData, fileName, "application/pdf");
  }
};
