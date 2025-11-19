export default {
	profesional: {},
	persona: {},
	domicilio: {},
	agenda: [],
	dias: [
		{value: "lunes", label: "Lunes"},
		{value: "martes", label: "Martes"},
		{value: "miercoles", label: "Miercoles"},
		{value: "jueves", label: "Jueves"},
		{value: "viernes", label: "Viernes"},
		{value: "sabado", label: "Sabado"},
		{value: "domingo", label: "Domingo"},
	],
	async loadInitialData() {

		try {
			// 1) id del profesional desde la URL
			const profId = appsmith.URL.queryParams.id;
			if (!profId) {
				showAlert("Falta el parámetro id en la URL", "warning");
				return;
			}

			// 2) Profesional
			const profRows = await getProfesional.run({ id: profId });
			console.log("profRows ", profRows)
			const profesional = profRows?.[0];
			if (!profesional) {
				throw new Error("Profesional no encontrado");
			}
			this.profesional = profesional;

			// 3) Persona (usa persona_id que vino en profesional)
			const perRows = await getPersona.run({ id: profesional.persona_id });
			console.log("perRows ", perRows)
			const persona = perRows?.[0];
			if (!persona) {
				throw new Error("Persona no encontrada");
			}
			this.persona = persona

			if (!persona.domicilio_id) {
				showAlert(`La persona ${persona.nombre} no tiene domicilio`, "error");
				return { profesional, persona };
			}

			// 4) Domicilio (usa domicilio_id de persona)
			const domRows = await getDomicilio.run({ id: persona.domicilio_id });
			const domicilio = domRows?.[0];
			if (!domicilio) {
				throw new Error("Domicilio no encontrado");
			}
			this.domicilio = domicilio

			const agendaRows = await listarAgenda.run({ id: profesional.id })
			this.agenda = agendaRows || []

			// 5) Devolver todo (opcional)
			// return { profesional, persona, domicilio };
		} catch (e) {
			showAlert(`Error cargando datos: ${e.message}`, "error");
			throw e;
		}
	}
};
