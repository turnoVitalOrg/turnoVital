export default {
	agenda: [],
	agendaOriginal: [],
	dias: [
		{ value: "lunes", label: "Lunes" },
		{ value: "martes", label: "Martes" },
		{ value: "miercoles", label: "Miercoles" },
		{ value: "jueves", label: "Jueves" },
		{ value: "viernes", label: "Viernes" },
		{ value: "sabado", label: "Sabado" },
		{ value: "domingo", label: "Domingo" },
	],
	hayCambios: false,

	async init() {
		const profId = appsmith.URL.queryParams.id;
		if (!profId) return;
		
		try {
			const res = await listarAgenda.run({ id: profId });
			// Inicializamos ambos arrays con la data fresca
			configurarAgenda.agenda = res || [];
			configurarAgenda.agendaOriginal = JSON.parse(JSON.stringify(configurarAgenda.agenda));
			configurarAgenda.hayCambios = false;
		} catch (error) {
			console.error("Error en init:", error);
		}
	},

	async onDelete(id) {
		// Filtramos el array actual
		configurarAgenda.agenda = configurarAgenda.agenda.filter(item => String(item.id) !== String(id));
		configurarAgenda.hayCambios = true;
		showAlert("Fila removida (descarga el PDF para ver los cambios)", "info");
	},

	async onChange(updatedRow) {
		// Esta función es la que te daba error. Ahora existe y actualiza la fila editada.
		configurarAgenda.agenda = configurarAgenda.agenda.map(item => 
			String(item.id) === String(updatedRow.id) ? updatedRow : item
		);
		configurarAgenda.hayCambios = true;
	},

	async onSave(data) {
		const nuevoItem = { id: "nuevo" + Date.now(), ...data };
		configurarAgenda.agenda = [...configurarAgenda.agenda, nuevoItem];
		configurarAgenda.hayCambios = true;
	},

	getDetalleCambios() {
		const originales = configurarAgenda.agendaOriginal || [];
		const actuales = configurarAgenda.agenda || [];
		
		// 1. Detectar eliminados (estaban en original pero no en actual)
		const eliminados = originales.filter(o => !actuales.some(a => String(a.id) === String(o.id)));
		
		// 2. Detectar nuevos (IDs que empiezan con "nuevo")
		const nuevos = actuales.filter(a => String(a.id).startsWith("nuevo"));
		
		// 3. Detectar editados (mismo ID pero datos distintos)
		const editados = actuales.filter(a => {
			const orig = originales.find(o => String(o.id) === String(a.id));
			if (!orig || String(a.id).startsWith("nuevo")) return false;
			return JSON.stringify(orig) !== JSON.stringify(a);
		});

		return [
			...nuevos.map(n => ({ tipo: "nuevo", data: n })),
			...eliminados.map(e => ({ tipo: "eliminado", data: e })),
			...editados.map(ed => ({ tipo: "editado", data: ed })),
		];
	},

	async onSubmit() {
		const agendaProcesada = configurarAgenda.agenda.map(a => {
			if (String(a.id).startsWith("nuevo")) {
				const { id, ...rest } = a;
				return rest;
			}
			return { ...a };
		});

		await sincronizarAgenda.run({
			profesionalId: appsmith.URL.queryParams.id,
			agenda: agendaProcesada
		});

		showAlert("Base de datos actualizada", "success");
		await configurarAgenda.init(); // Recargamos todo
	}
}