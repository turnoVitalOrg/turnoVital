export default {
	downloadAgendaPDF: async () => {
		try {
			// Obtenemos los cambios del otro objeto
			const cambios = configurarAgenda.getDetalleCambios();
			
			if (!cambios || cambios.length === 0) {
				return showAlert("No se detectó transacción para exportar", "warning");
			}

			// Verificamos que existan los datos del profesional, sino usamos genérico
			const nombre = (loadInitialData.persona && loadInitialData.persona.nombre) ? loadInitialData.persona.nombre : "Profesional";
			const apellido = (loadInitialData.persona && loadInitialData.persona.apellido) ? loadInitialData.persona.apellido : "";

			await agendaPDF.generatePDF(cambios, nombre, apellido);
		} catch (error) {
			console.error("Error en downloadAgendaPDF:", error);
			showAlert("Error de datos: " + error.message, "error");
		}
	},

	generatePDF: async (cambiosData, nombre, apellido) => {
		const doc = new jspdf.jsPDF();
		
		// Función interna para no fallar si la hora es null
		const fmt = (h) => {
			if (!h) return "00:00";
			return h.split(":").slice(0, 2).join(":");
		};

		const verde = [119, 181, 37]; 
		const negro = [35, 31, 32];

		// Encabezado
		doc.setFontSize(20).setTextColor(...negro).text("Detalle", 105, 20, { align: "center" });
		doc.setFontSize(14).setTextColor(...verde).text(`${nombre} ${apellido}`, 105, 28, { align: "center" });
		doc.setDrawColor(...verde).line(20, 35, 190, 35);

		let y = 45;
		doc.setFontSize(10).setTextColor(...negro);
		doc.text("ACCIÓN", 20, y);
		doc.text("DÍA", 60, y);
		doc.text("INICIO", 100, y);
		doc.text("FIN", 140, y);
		
		y += 10;

		cambiosData.forEach(c => {
			if (y > 275) { doc.addPage(); y = 20; }
			
			// Si por algún motivo c.data no existe, saltamos esta línea para que no de error
			if (!c.data) return;

			// Color según el tipo
			if (c.tipo === "nuevo") doc.setTextColor(0, 128, 0); 
			else if (c.tipo === "eliminado") doc.setTextColor(200, 0, 0); 
			else doc.setTextColor(0, 0, 200); 

			// Texto de la acción
			doc.text(String(c.tipo).toUpperCase(), 20, y);
			
			// Volvemos a negro para los datos
			doc.setTextColor(...negro);
			
			// Día (verificamos ambos nombres de columna posibles)
			const dia = c.data.dia_semana || c.data.dia || "---";
			doc.text(String(dia), 60, y);
			
			// Horas
			doc.text(fmt(c.data.hora_inicio), 100, y);
			doc.text(fmt(c.data.hora_fin), 140, y);
			
			y += 8;
		});

		const fileName = `Cambios_${apellido || "Agenda"}.pdf`;
		download(doc.output("datauristring"), fileName, "application/pdf");
	}
}