export default {
	generarHorarios() {
		const horarios = [];
		let hora = 8; // empieza a las 08:00

		while (hora < 24) {
			const hStr = hora.toString().padStart(2, "0") + ":00";
			horarios.push({
				label: hStr,
				value: hStr + ":00"
			});
			hora++;
		}

		return horarios;
	}
};
