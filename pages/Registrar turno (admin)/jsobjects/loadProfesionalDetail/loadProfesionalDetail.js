export default {
	profesional: {},
	persona: {},
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

			// mostrarAgenda.run({id: profId})
			mostrarTurnos2.run({id: profId})
		} catch (e) {
			showAlert(`Error cargando datos: ${e.message}`, "error");
			throw e;
		}
	}
};
