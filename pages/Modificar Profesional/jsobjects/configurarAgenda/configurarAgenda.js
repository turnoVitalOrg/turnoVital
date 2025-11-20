export default {
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
	hayCambios: false,
	async init(){
		const profId = appsmith.URL.queryParams.id;
		if (!profId) {
			showAlert("Falta el parámetro id en la URL", "warning");
			return;
		}
		const agendaRows = await listarAgenda.run({ id: profId })
		this.agenda = agendaRows || []

		this.hayCambios = false;
	},
	async onDelete(id){
		const indexDelete = this.agenda.findIndex(a => a.id == id);
		this.agenda.splice(indexDelete, 1);
		this.hayCambios = true;
	},
	async onSave(data) {
		this.agenda.push({
			id: "nuevo" + String(this.agenda.length),
			...data
		})
		this.hayCambios = true
	},
	async onChange(updateRow) {
		this.agenda = this.agenda.map(a => {
			if (a.id == updateRow.id) {
				return updateRow
			}
			return a
		})

		this.hayCambios = true
	},

	async onSubmit () {
		const agendaProcesada = this.agenda.map(a =>  {
			if (a.id.startsWith("nuevo")) {
				const {id,...rest}=a;
				return rest;		
			}
			return {...a}
		})
		console.log("AGENDA PROCESADA ", agendaProcesada)
		const respuesta = await sincronizarAgenda.run({
			profesionalId: appsmith.URL.queryParams.id,
			agenda: agendaProcesada
		})

		console.log("ONSUBMIT RESPUESTA ", respuesta)
		
		//refresh agregado
    const profId = appsmith.URL.queryParams.id;
    const agendaActualizada = await listarAgenda.run({ id: profId });
    this.agenda = agendaActualizada || [];
		
		this.hayCambios = false;
	}
}