export default {
	async crear () {
		try {
			console.log('=== INICIO: Crear Turno ===');
			
			console.log('profesional_id:', appsmith.URL.queryParams.id);
			console.log('paciente_id:', pacienteSelect.selectedOptionValue);
			console.log('hora:', horaSelect.selectedOptionValue);
			console.log('fecha raw:', diaSelect.selectedDate);
			console.log('fecha formateada:', diaSelect.selectedDate ? diaSelect.selectedDate.split("T")[0] : 'UNDEFINED');
			
			const data = {
				"profesional_id": appsmith.URL.queryParams.id,
				"paciente_id": pacienteSelect.selectedOptionValue,
				"hora": horaSelect.selectedOptionValue,
				"fecha": diaSelect.selectedDate ? diaSelect.selectedDate.split("T")[0] : null
			};
			
			console.log('Data completa a enviar:', data);
			
			// Validaciones
			if (!data.profesional_id) {
				showAlert('Falta profesional_id', 'error');
				return { success: false, error: 'Falta profesional_id' };
			}
			if (!data.paciente_id) {
				showAlert('Falta seleccionar paciente', 'error');
				return { success: false, error: 'Falta paciente_id' };
			}
			if (!data.hora) {
				showAlert('Falta seleccionar hora', 'error');
				return { success: false, error: 'Falta hora' };
			}
			if (!data.fecha) {
				showAlert('Falta seleccionar fecha', 'error');
				return { success: false, error: 'Falta fecha' };
			}
			
			console.log('=== Ejecutando crearTurnos.run() ===');
			const resultado = await crearTurnos.run({ data: data });
			console.log('Resultado crearTurnos:', resultado);
			
			console.log('=== Ejecutando mostrarTurnos.run() ===');
			await mostrarTurnos2.run({ id: appsmith.URL.queryParams.id });
			console.log('mostrarTurnos ejecutado');
			
			console.log('=== FIN: Turno creado exitosamente ===');
			showAlert('Turno creado exitosamente', 'success');
			return { success: true, data: resultado };
			
		} catch (error) {
			console.error('❌ ERROR al crear turno:', error);
			console.error('Mensaje:', error.message);
			showAlert('Error al crear turno: ' + (error.message || error), 'error');
			return { success: false, error: error.message };
		}
	}
}