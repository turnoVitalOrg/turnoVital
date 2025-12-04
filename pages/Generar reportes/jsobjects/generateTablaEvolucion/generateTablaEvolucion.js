export default {
  llenarTabla: () => {
    try {
      const mesesArray = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

      // Obtener rango de meses
      const [nombreMesDesde, anioDesdeStr] = dd_mesDesde.selectedOptionValue.split(" ");
      const mesDesde = mesesArray.indexOf(nombreMesDesde);
      const anioDesde = parseInt(anioDesdeStr);

      const [nombreMesHasta, anioHastaStr] = dd_mesHasta.selectedOptionValue.split(" ");
      const mesHasta = mesesArray.indexOf(nombreMesHasta);
      const anioHasta = parseInt(anioHastaStr);

      const estado = dd_estado2.selectedOptionValue;

      // Filtrar turnos por rango de meses
      let turnosFiltrados = getTurnos.data.filter(t => {
        const fechaTurno = new Date(t.fecha);
        const mes = fechaTurno.getMonth();
        const anio = fechaTurno.getFullYear();
        const desdeNum = anioDesde*12 + mesDesde;
        const hastaNum = anioHasta*12 + mesHasta;
        const actualNum = anio*12 + mes;
        return actualNum >= desdeNum && actualNum <= hastaNum;
      });

      // Generar tabla por mes
      const tabla = [];
      for (let y = anioDesde; y <= anioHasta; y++) {
        const mesIni = y === anioDesde ? mesDesde : 0;
        const mesFin = y === anioHasta ? mesHasta : 11;

        for (let m = mesIni; m <= mesFin; m++) {
          const mesTexto = `${mesesArray[m]} ${y}`;
          const turnosMes = turnosFiltrados.filter(t => {
            const fechaTurno = new Date(t.fecha);
            return fechaTurno.getMonth() === m && fechaTurno.getFullYear() === y;
          });

          let total = 0;
          if (estado === "Asistidos") total = turnosMes.filter(t => t.estado === true).length;
          else if (estado === "No Asistidos") total = turnosMes.filter(t => t.estado === false).length;
          else total = turnosMes.length; // "Todos"

          tabla.push({
            "Mes": mesTexto,
            "Total": total
          });
        }
      }

      return tabla; // Retornamos array listo para Table Data
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
