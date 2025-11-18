export default {
	async GuardarTodo() {
		const dias = ["lunes", "martes", "miercoles", "jueves", "viernes"];
		try {
			for (const dia of dias) {
				const data = this.obtenerDataDia(dia);
				if (!data.hora_inicio || !data.hora_fin) {
					console.log(`Día ${dia} ignorado: horas incompletas`);
					continue;
				}
				if (!data.id) {
					await crearAgenda.run({
						dia_semana: dia,
						hora_inicio: data.hora_inicio,
						hora_fin: data.hora_fin
					});
					showAlert(`Día ${dia} creado correctamente`, "success");
				} else {
					await actualizarAgenda.run({
						id: data.id,
						hora_inicio: data.hora_inicio,
						hora_fin: data.hora_fin
					});
					showAlert(`Día ${dia} actualizado`, "success");
				}
			}
			await configurarAgenda.refrescarInfo();
			showAlert("Todos los cambios fueron guardados", "success");
		} catch (error) {
			showAlert("Error al guardar toda la agenda", "error");
			console.log("Error en guardarTodo:", error);
		}
	},

	// ⬆⬆⬆ ESTA COMA FALTABA ⬆⬆⬆

	obtenerDataDia(dia) {
		switch (dia) {
			case "lunes":
				return {
					id: configurarAgenda.lunesData[0]?.id || null,
					hora_inicio: lunesHoraInicio.selectedOptionValue,
					hora_fin: lunesHoraFin.selectedOptionValue
				};

			case "martes":
				return {
					id: configurarAgenda.martesData[0]?.id || null,
					hora_inicio: martesHoraInicio.selectedOptionValue,
					hora_fin: martesHoraFin.selectedOptionValue
				};

			case "miercoles":
				return {
					id: configurarAgenda.miercolesData[0]?.id || null,
					hora_inicio: miercolesHoraInicio.selectedOptionValue,
					hora_fin: miercolesHoraFin.selectedOptionValue
				};

			case "jueves":
				return {
					id: configurarAgenda.juevesData[0]?.id || null,
					hora_inicio: juevesHoraInicio.selectedOptionValue,
					hora_fin: juevesHoraFin.selectedOptionValue
				};

			case "viernes":
				return {
					id: configurarAgenda.viernesData[0]?.id || null,
					hora_inicio: viernesHoraInicio.selectedOptionValue,
					hora_fin: viernesHoraFin.selectedOptionValue
				};
		}
	}
};
