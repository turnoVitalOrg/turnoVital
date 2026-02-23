export default {

  downloadAgendaPDF: async () => {
    try {

      const cambios = configurarAgenda.getCambiosParaExportar();

      if (!cambios || cambios.length === 0) {
        showAlert("No hay cambios para exportar", "warning");
        return;
      }

      const nombreProfesional = loadInitialData.persona?.nombre ?? "";
      const apellidoProfesional = loadInitialData.persona?.apellido ?? "";

      await agendaPDF.generatePDF(
        cambios,
        nombreProfesional,
        apellidoProfesional
      );

    } catch (e) {
      console.error("Error al generar PDF:", e);
      showAlert("Error al generar PDF", "error");
    }
  },

  generatePDF: async (cambiosData, nombreProfesional, apellidoProfesional) => {

    const doc = new jspdf.jsPDF();

    const formatearHora = (hora) => {
      if (!hora) return "";
      return hora.split(":").slice(0, 2).join(":");
    };

    const primary = [119, 181, 37];
    const text = [35, 31, 32];
    const gray = [113, 110, 110];

    // ENCABEZADO
    doc.setFontSize(24);
    doc.setTextColor(...text);
    doc.text("Cambios en Agenda del Profesional", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(...primary);
    doc.text(`${nombreProfesional} ${apellidoProfesional}`, 105, 28, { align: "center" });

    const fecha = new Date().toLocaleDateString("es-AR");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text(`Generado el ${fecha}`, 105, 34, { align: "center" });

    doc.setDrawColor(...primary);
    doc.setLineWidth(0.7);
    doc.line(20, 38, 190, 38);

    let y = 50;

    const imprimirEncabezadoTabla = () => {

      doc.setFontSize(12);
      doc.setTextColor(...text);
      doc.setFont(undefined, "bold");

      doc.text("Tipo", 20, y);
      doc.text("Día", 50, y);
      doc.text("Inicio", 100, y);
      doc.text("Fin", 140, y);

      y += 7;
      doc.setFont(undefined, "normal");
    };

    imprimirEncabezadoTabla();

    cambiosData.forEach(cambio => {

      if (y > 270) {
        doc.addPage();
        y = 20;
        imprimirEncabezadoTabla();
      }

      const row = cambio.data;

      doc.text(cambio.tipo.toUpperCase(), 20, y);
      doc.text(row.dia_semana || row.dia || "", 50, y);
      doc.text(formatearHora(row.hora_inicio), 100, y);
      doc.text(formatearHora(row.hora_fin), 140, y);

      y += 7;
    });

    const pages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...gray);

      doc.text(`Página ${i} de ${pages}`, 105, 287, { align: "center" });
      doc.text("TurnoVital - Sistema de Gestión de Turnos", 105, 293, { align: "center" });
    }

    const fechaArchivo = new Date().toISOString().split("T")[0];
    const fileName = `Cambios_Agenda_${nombreProfesional}_${apellidoProfesional}_${fechaArchivo}.pdf`;

    const pdfData = doc.output("datauristring");
    download(pdfData, fileName, "application/pdf");
  }
};