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
              const dataTurnosPorMes = await turnosPorMes.run();
              console.log('✓ Turnos Por Mes:', dataTurnosPorMes);
              const dataTurnosPorEsp = await turnosPorEspecialidad.run();
              console.log('✓ Turnos Por Especialidad:', dataTurnosPorEsp);
              const dataProfPorEsp = await profesionalesPorEspecialidad.run();
              console.log('✓ Profesionales Por Especialidad:', dataProfPorEsp);

              const getValue = (data) => {
                  if (!data || data.length === 0) return 0;
                  const item = data[0];
                  return item?.count || item?.total || item?.cantidad || Object.values(item)[0] || 0;
              };

              const formatMes = (mes) => {
                  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                  if (typeof mes === 'number') {
                      return meses[mes - 1] || String(mes);
                  }
                  if (typeof mes === 'string') {
                      const fecha = new Date(mes);
                      if (!isNaN(fecha.getTime())) {
                          return meses[fecha.getMonth()] + ' ' + fecha.getFullYear();
                      }
                      return mes;
                  }
                  return String(mes);
              };

              console.log('=== Creando documento PDF ===');
              const doc = new jspdf.jsPDF();
              const primaryColor = [119, 181, 37];
              const textColor = [35, 31, 32];
              const grayColor = [113, 110, 110];

              doc.setFontSize(24);
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);
              doc.text('Informe Dashboard - TurnoVital', 105, 20, { align: 'center' });

              doc.setFontSize(10);
              doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
              const fecha = new Date().toLocaleDateString('es-AR');
              doc.text('Generado el: ' + fecha, 105, 28, { align: 'center' });

              const cantPacientes = getValue(dataPacientes);
              const cantProfesionales = getValue(dataProfesionales);
              const cantEspecialidades = getValue(dataEspecialidades);

              doc.setFontSize(9);
              doc.text('Total Pacientes: ' + cantPacientes + ' | Total Profesionales: ' + cantProfesionales + ' | Total Especialidades: ' + cantEspecialidades, 105, 34, { align: 'center' });

              doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.setLineWidth(0.5);
              doc.line(20, 38, 190, 38);

              let yPos = 48;

              doc.setFontSize(16);
              doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.text('Turnos Mensuales', 20, yPos);
              yPos += 8;

              doc.setFontSize(10);
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);

              if (dataTurnosPorMes && dataTurnosPorMes.length > 0) {
                  doc.setFont(undefined, 'bold');
                  doc.text('Mes', 25, yPos);
                  doc.text('Asistidos', 85, yPos);
                  doc.text('No Asistidos', 130, yPos);
                  doc.text('Total', 170, yPos);
                  yPos += 6;
                  doc.setFont(undefined, 'normal');

                  dataTurnosPorMes.slice(0, 10).forEach(turno => {
                      const total = (turno.turnos_asistidos || 0) + (turno.turnos_no_asistidos || 0);
                      const mesFormateado = formatMes(turno.month);

                      doc.text(mesFormateado, 25, yPos);
                      doc.text(String(turno.turnos_asistidos || 0), 85, yPos);
                      doc.text(String(turno.turnos_no_asistidos || 0), 130, yPos);
                      doc.text(String(total), 170, yPos);
                      yPos += 6;
                  });
              } else {
                  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
                  doc.text('No hay datos disponibles', 25, yPos);
                  yPos += 6;
              }

              yPos += 5;

              if (yPos > 240) {
                  doc.addPage();
                  yPos = 20;
              }

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
              } else {
                  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
                  doc.text('No hay datos disponibles', 30, yPos);
                  yPos += 6;
              }

              yPos += 5;

              if (yPos > 240) {
                  doc.addPage();
                  yPos = 20;
              }

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
              } else {
                  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
                  doc.text('No hay datos disponibles', 30, yPos);
              }

              const pageCount = doc.internal.getNumberOfPages();
              for (let i = 1; i <= pageCount; i++) {
                  doc.setPage(i);
                  doc.setFontSize(8);
                  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
                  doc.text('Pagina ' + i + ' de ' + pageCount, 105, 287, { align: 'center' });
                  doc.text('TurnoVital - Sistema de Gestion de Turnos', 105, 292, { align: 'center' });
              }

              const fileName = 'Informe_Dashboard_' + new Date().toISOString().split('T')[0] + '.pdf';
              const pdfBase64 = doc.output('datauristring');
              download(pdfBase64, fileName, 'application/pdf');

              showAlert('PDF generado exitosamente', 'success');
              return { success: true };
          } catch (error) {
              console.error('❌ ERROR:', error);
              showAlert('Error al generar el PDF: ' + error.message, 'error');
              return { success: false, error: error.message };
          }
      }
  }
