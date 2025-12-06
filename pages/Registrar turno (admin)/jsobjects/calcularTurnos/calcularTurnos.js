export default {
	turnosDisponibles: [],
	async calcularTurnos (fecha) {

		this.turnosDisponibles = [];

		const date = new Date(fecha)
		const currentDay = date.toLocaleDateString('es-AR', { weekday: 'long' })

		const agenda = mostrarAgenda.data.find((a) => a.dia_semana === currentDay) //fecha.day()

		if (!agenda) {
			showAlert("No hay agenda para el dia seleccionado", "error")
			return
		}

		const profId = appsmith.URL.queryParams.id;

		await mostrarTurnosPorDia.run({id: profId, fecha: fecha })

		const totalHorarios = this.generarHorarios(agenda.hora_inicio, agenda.hora_fin)
		console.log("TOTAL HORARIOS CALCULADOS ", totalHorarios)

		console.log("TOTAL TURNOS ", mostrarTurnos2.data)

		// Recorremos todos los horarios que tiene el profesional y solo dejamos los horarios que no se encuentran entre los turnos ya solicitados.
		this.turnosDisponibles = totalHorarios.filter((horario) => !mostrarTurnosPorDia.data.find((turno) => turno.hora == horario.code)) 

		console.log("TURNOS FINALES ", this.turnosDisponibles)

	},
	generarHorarios(horaInicio, horaFin) {
		const horarios = [];
		let hora = Number(horaInicio.substr(0, 2)); // La hora inicio y fin me llegan en formato string 08:00 y necesito convertirlo a numero

		while (hora < Number(horaFin.substr(0, 2))) {
			const hStr = hora.toString().padStart(2, "0") + ":00";
			horarios.push({
				name: hStr,
				code: hStr + ":00"
			});
			hora++;
		}

		return horarios;
	}
}