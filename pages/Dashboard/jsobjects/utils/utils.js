export default {
	generateInvoice: async () => {
		try {
			console.log('=== INICIO: Obteniendo datos ===');
			const dataPacientes = await totalPacientes.run();
			console.log('✓ Pacientes:', dataPacientes);
			const dataProfesionales = await totalProfesionales.run();
			console.log('✓ Profesionales:', dataProfesionales);
			const dataEspecialidades = await totalEspecialidades.run();
			console.log('✓ Especialidades:', dataEspecialidades);
			const dataTurnosHoy = await totalTurnosHoy.run();
			console.log('✓ Turnos Hoy:', dataTurnosHoy);
			const dataTurnosAsistidos = await totalTurnosHoyAsistido.run();
			console.log('✓ Turnos Asistidos:', dataTurnosAsistidos);
			const dataTurnosNoAsistidos = await totalTurnosHoyNoAsistido.run();
			console.log('✓ Turnos No Asistidos:', dataTurnosNoAsistidos);
			const dataTurnosOtorgados = await totalTurnosHoyOtorgados.run();
			console.log('✓ Turnos Otorgados:', dataTurnosOtorgados);
			const dataTurnosPorMes = await turnosPorMes.run();
			console.log('✓ Turnos Por Mes:', dataTurnosPorMes);
			const dataTurnosPorEsp = await turnosPorEspecialidad.run();
			console.log('✓ Turnos Por Especialidad:', dataTurnosPorEsp);
			const dataProfPorEsp = await profesionalesPorEspecialidad.run();
			console.log('✓ Profesionales Por Especialidad:', dataProfPorEsp);

			console.log('=== Creando documento PDF ===');
			const doc = new jspdf.jsPDF();
			console.log('✓ Documento creado');

			const primaryColor = [119, 181, 37];
			const textColor = [35, 31, 32];
			const grayColor = [113, 110, 110];

			console.log('=== Agregando encabezado ===');
			doc.setFontSize(24);
			doc.setTextColor(textColor[0], textColor[1], textColor[2]);
			doc.text('Informe Dashboard - TurnoVital', 105, 20, { align: 'center' });
			console.log('✓ Titulo agregado');

			doc.setFontSize(10);
			doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
			const fecha = new Date().toLocaleDateString('es-AR');
			doc.text('Generado el: ' + fecha, 105, 28, { align: 'center' });
			console.log('✓ Fecha agregada');

			doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
			doc.setLineWidth(0.5);
			doc.line(20, 32, 190, 32);
			console.log('✓ Linea separadora agregada');

			let yPos = 42;

			console.log('=== Agregando metricas ===');
			doc.setFontSize(16);
			doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
			doc.text('Metricas Principales', 20, yPos);
			yPos += 8;

			doc.setFontSize(11);
			doc.setTextColor(textColor[0], textColor[1], textColor[2]);

			const metricsData = [
				{ label: 'Total de Pacientes', value: dataPacientes[0]?.count || 0 },
				{ label: 'Total de Profesionales', value: dataProfesionales[0]?.count || 0 },
				{ label: 'Total de Especialidades', value: dataEspecialidades[0]?.count || 0 },
				{ label: 'Turnos Hoy', value: dataTurnosHoy[0]?.count || 0 },
				{ label: 'Turnos Asistidos Hoy', value: dataTurnosAsistidos[0]?.count || 0 },
				{ label: 'Turnos No Asistidos Hoy', value: dataTurnosNoAsistidos[0]?.count || 0 },
				{ label: 'Turnos Otorgados Hoy', value: dataTurnosOtorgados[0]?.count || 0 }
			];
			console.log('Metricas preparadas:', metricsData);

			metricsData.forEach((metric, index) => {
				const col = index % 2;
				const row = Math.floor(index / 2);
				const xPos = col === 0 ? 20 : 110;
				const currentY = yPos + (row * 8);

				doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
				doc.text(metric.label + ':', xPos, currentY);
				doc.setTextColor(textColor[0], textColor[1], textColor[2]);
				doc.setFont(undefined, 'bold');
				doc.text(String(metric.value), xPos + 50, currentY);
				doc.setFont(undefined, 'normal');
			});
			console.log('✓ Metricas agregadas');

			yPos += (Math.ceil(metricsData.length / 2) * 8) + 10;

			console.log('=== Agregando turnos mensuales ===');
			doc.setFontSize(16);
			doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
			doc.text('Turnos Mensuales', 20, yPos);
			yPos += 8;

			doc.setFontSize(10);
			doc.setTextColor(textColor[0], textColor[1], textColor[2]);

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
				console.log('✓ Turnos mensuales agregados');
			} else {
				doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
				doc.text('No hay datos disponibles', 25, yPos);
				yPos += 6;
				console.log('⚠ No hay datos de turnos mensuales');
			}

			yPos += 5;

			if (yPos > 240) {
				doc.addPage();
				yPos = 20;
				console.log('✓ Nueva pagina agregada');
			}

			console.log('=== Agregando turnos por especialidad ===');
			doc.setFontSize(16);
			doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
			doc.text('Turnos por Especialidad', 20, yPos);
			yPos += 8;

			doc.setFontSize(10);
			doc.setTextColor(textColor[0], textColor[1], textColor[2]);

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
				console.log('✓ Turnos por especialidad agregados');
			} else {
				doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
				doc.text('No hay datos disponibles', 30, yPos);
				yPos += 6;
				console.log('⚠ No hay datos de turnos por especialidad');
			}

			yPos += 5;

			if (yPos > 240) {
				doc.addPage();
				yPos = 20;
				console.log('✓ Nueva pagina agregada');
			}

			console.log('=== Agregando profesionales por especialidad ===');
			doc.setFontSize(16);
			doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
			doc.text('Profesionales por Especialidad', 20, yPos);
			yPos += 8;

			doc.setFontSize(10);
			doc.setTextColor(textColor[0], textColor[1], textColor[2]);

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
				console.log('✓ Profesionales por especialidad agregados');
			} else {
				doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
				doc.text('No hay datos disponibles', 30, yPos);
				console.log('⚠ No hay datos de profesionales por especialidad');
			}

			console.log('=== Agregando pie de pagina ===');
			const pageCount = doc.internal.getNumberOfPages();
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i);
				doc.setFontSize(8);
				doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
				doc.text('Pagina ' + i + ' de ' + pageCount, 105, 287, { align: 'center' });
				doc.text('TurnoVital - Sistema de Gestion de Turnos', 105, 292, { align: 'center' });
			}
			console.log('✓ Pie de pagina agregado');

			console.log('=== Guardando PDF ===');
			const fileName = 'Informe_Dashboard_' + new Date().toISOString().split('T')[0] + '.pdf';
			console.log('Nombre archivo:', fileName);

			// Generar el PDF como base64
			const pdfBase64 = doc.output('datauristring');
			console.log('✓ PDF generado como base64');

			// Usar la función de descarga de Appsmith
			download(pdfBase64, fileName, 'application/pdf');
			console.log('✓ Descarga ejecutada');

			console.log('=== FIN: PDF generado exitosamente ===');
			showAlert('PDF generado exitosamente', 'success');
			return { success: true };
		}catch (error) {
			console.error('❌ ERROR:', error);
			console.error('Stack:', error.stack);
			console.error('Mensaje:', error.message);
			showAlert('Error al generar el PDF: ' + error.message, 'error');
			return { success: false, error: error.message };
		}
	}
}
