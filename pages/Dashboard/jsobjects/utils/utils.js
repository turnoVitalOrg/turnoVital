export default {
	generateInvoice: async () => {
		try {
			const dataPacientes = await totalPacientes.run();
			const dataProfesionales = await totalProfesionales.run();
			const dataEspecialidades = await totalEspecialidades.run();
			const dataTurnosHoy = await totalTurnosHoy.run();
			const dataTurnosAsistidos = await totalTurnosHoyAsistido.run();
			const dataTurnosNoAsistidos = await totalTurnosHoyNoAsistido.run();
			const dataTurnosOtorgados = await totalTurnosHoyOtorgados.run();
			const dataTurnosPorMes = await turnosPorMes.run();
			const dataTurnosPorEsp = await turnosPorEspecialidad.run();
			const dataProfPorEsp = await profesionalesPorEspecialidad.run();
			
			const doc = new jspdf.jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4'
			});
			
			const primaryColor = [119, 181, 37];
			const textColor = [35, 31, 32];
			const grayColor = [113, 110, 110];
			
			doc.setFontSize(24);
			doc.setTextColor(...textColor);
			doc.text('Informe Dashboard - TurnoVital', 105, 20, { align: 'center' });
			
			doc.setFontSize(10);
			doc.setTextColor(...grayColor);
			const fecha = new Date().toLocaleDateString('es-AR', { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric' 
			});
			doc.text(`Generado el: ${fecha}`, 105, 28, { align: 'center' });
			
			doc.setDrawColor(...primaryColor);
			doc.setLineWidth(0.5);
			doc.line(20, 32, 190, 32);
			
			let yPos = 42;
			
			doc.setFontSize(16);
			doc.setTextColor(...primaryColor);
			doc.text('Métricas Principales', 20, yPos);
			yPos += 8;
			
			doc.setFontSize(11);
			doc.setTextColor(...textColor);
			
			const metricsData = [
				{ label: 'Total de Pacientes', value: dataPacientes[0]?.count || 0 },
				{ label: 'Total de Profesionales', value: dataProfesionales[0]?.count || 0 },
				{ label: 'Total de Especialidades', value: dataEspecialidades[0]?.count || 0 },
				{ label: 'Turnos Hoy', value: dataTurnosHoy[0]?.count || 0 },
				{ label: 'Turnos Asistidos Hoy', value: dataTurnosAsistidos[0]?.count || 0 },
				{ label: 'Turnos No Asistidos Hoy', value: dataTurnosNoAsistidos[0]?.count || 0 },
				{ label: 'Turnos Otorgados Hoy', value: dataTurnosOtorgados[0]?.count || 0 }
			];
			
			metricsData.forEach((metric, index) => {
				const col = index % 2;
				const row = Math.floor(index / 2);
				const xPos = col === 0 ? 20 : 110;
				const currentY = yPos + (row * 8);
				
				doc.setTextColor(...grayColor);
				doc.text(metric.label + ':', xPos, currentY);
				doc.setTextColor(...textColor);
				doc.setFont(undefined, 'bold');
				doc.text(String(metric.value), xPos + 50, currentY);
				doc.setFont(undefined, 'normal');
			});
			
			yPos += (Math.ceil(metricsData.length / 2) * 8) + 10;
			
			doc.setFontSize(16);
			doc.setTextColor(...primaryColor);
			doc.text('Turnos Mensuales', 20, yPos);
			yPos += 8;
			
			doc.setFontSize(10);
			doc.setTextColor(...textColor);
			
			if (dataTurnosPorMes && dataTurnosPorMes.length > 0) {
				doc.setFont(undefined, 'bold');
				doc.text('Mes', 25, yPos);
				doc.text('Asistidos', 80, yPos);
				doc.text('No Asistidos', 130, yPos);
				doc.text('Total', 170, yPos);
				yPos += 6;
				doc.setFont(undefined, 'normal');
				
				dataTurnosPorMes.slice(0, 10).forEach(turno => {
					const total = (turno.turnos_asistidos || 0) + (turno.turnos_no_asistidos || 0);
					doc.text(String(turno.mes || ''), 25, yPos);
					doc.text(String(turno.turnos_asistidos || 0), 80, yPos);
					doc.text(String(turno.turnos_no_asistidos || 0), 130, yPos);
					doc.text(String(total), 170, yPos);
					yPos += 6;
				});
			} else {
				doc.setTextColor(...grayColor);
				doc.text('No hay datos disponibles', 25, yPos);
				yPos += 6;
			}
			
			yPos += 5;
			
			if (yPos > 240) {
				doc.addPage();
				yPos = 20;
			}
			
			doc.setFontSize(16);
			doc.setTextColor(...primaryColor);
			doc.text('Turnos por Especialidad', 20, yPos);
			yPos += 8;
			
			doc.setFontSize(10);
			doc.setTextColor(...textColor);
			
			if (dataTurnosPorEsp && dataTurnosPorEsp.length > 0) {
				doc.setFont(undefined, 'bold');
				doc.text('Especialidad', 30, yPos);
				doc.text('Cantidad', 140, yPos);
				yPos += 6;
				doc.setFont(undefined, 'normal');
				
				dataTurnosPorEsp.slice(0, 10).forEach(item => {
					doc.text(String(item.especialidad_nombre || ''), 30, yPos);
					doc.text(String(item.cantidad_turnos || 0), 140, yPos);
					yPos += 6;
				});
			} else {
				doc.setTextColor(...grayColor);
				doc.text('No hay datos disponibles', 30, yPos);
				yPos += 6;
			}
			
			yPos += 5;
			
			if (yPos > 240) {
				doc.addPage();
				yPos = 20;
			}
			
			doc.setFontSize(16);
			doc.setTextColor(...primaryColor);
			doc.text('Profesionales por Especialidad', 20, yPos);
			yPos += 8;
			
			doc.setFontSize(10);
			doc.setTextColor(...textColor);
			
			if (dataProfPorEsp && dataProfPorEsp.length > 0) {
				doc.setFont(undefined, 'bold');
				doc.text('Especialidad', 30, yPos);
				doc.text('Cantidad', 140, yPos);
				yPos += 6;
				doc.setFont(undefined, 'normal');
				
				dataProfPorEsp.slice(0, 10).forEach(item => {
					doc.text(String(item.especialidad_nombre || ''), 30, yPos);
					doc.text(String(item.cantidad_profesionales || 0), 140, yPos);
					yPos += 6;
				});
			} else {
				doc.setTextColor(...grayColor);
				doc.text('No hay datos disponibles', 30, yPos);
			}
			
			const pageCount = doc.internal.getNumberOfPages();
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i);
				doc.setFontSize(8);
				doc.setTextColor(...grayColor);
				doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' });
				doc.text('TurnoVital - Sistema de Gestión de Turnos', 105, 292, { align: 'center' });
			}
			
			const fileName = `Informe_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`;
			doc.save(fileName);
			
			showAlert('PDF generado exitosamente', 'success');
		} catch (error) {
			console.error('Error generando PDF:', error);
			showAlert('Error al generar el PDF: ' + error.message, 'error');
		}
	}
}