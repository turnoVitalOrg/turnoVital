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

  // Inicializa los datos desde la DB
  async init() {
    const profId = appsmith.URL.queryParams.id;

    if (!profId) {
      showAlert("Falta el parámetro id en la URL", "warning");
      return;
    }

    const agendaRows = await listarAgenda.run({ id: profId });

    // Guardamos dos copias separadas
    this.agenda = JSON.parse(JSON.stringify(agendaRows || []));
    this.agendaOriginal = JSON.parse(JSON.stringify(this.agenda));
    
    showAlert("Agenda cargada", "info");
  },

  // Se llama desde el botón "Borrar" de la tabla
  async onDelete(id) {
    this.agenda = this.agenda.filter(a => a.id !== id);
  },

  // Se llama desde un formulario de "Nuevo"
  async onSave(data) {
    this.agenda.push({
      id: "nuevo_" + Date.now(),
      ...data
    });
  },

  // Se llama desde el evento "onSave" de la celda de la tabla (Inline Editing)
  async onChange(updateRow) {
    this.agenda = this.agenda.map(a =>
      a.id === updateRow.id ? updateRow : a
    );
  },

  // Función que calcula la diferencia entre lo actual y lo original
  getDetalleCambios() {
    const originales = this.agendaOriginal;
    const actuales = this.agenda;

    const nuevos = actuales.filter(a =>
      String(a.id).startsWith("nuevo_")
    );

    const eliminados = originales.filter(o =>
      !actuales.some(a => a.id == o.id)
    );

    const editados = actuales.filter(a => {
      const original = originales.find(o => o.id == a.id);
      // Si no existe o es nuevo, no es un "editado"
      if (!original || String(a.id).startsWith("nuevo_")) return false;
      // Comparamos si hubo cambios reales en los datos
      return JSON.stringify(original) !== JSON.stringify(a);
    });

    return [
      ...nuevos.map(n => ({ tipo: "nuevo", data: n })),
      ...eliminados.map(e => ({ tipo: "eliminado", data: e })),
      ...editados.map(ed => ({ tipo: "editado", data: ed })),
    ];
  },

  // Guarda en la base de datos
  async onSubmit() {
    const cambios = this.getDetalleCambios();
    
    if (cambios.length === 0) {
      showAlert("No hay cambios detectados para guardar", "warning");
      return;
    }

    const agendaProcesada = this.agenda.map(a => {
      if (String(a.id).startsWith("nuevo_")) {
        const { id, ...rest } = a; // Quitamos el ID temporal
        return rest;
      }
      return a;
    });

    await sincronizarAgenda.run({
      profesionalId: appsmith.URL.queryParams.id,
      agenda: agendaProcesada
    });

    showAlert("Cambios guardados correctamente", "success");

    // Actualizamos el original para que la tabla se considere "limpia"
    this.agendaOriginal = JSON.parse(JSON.stringify(this.agenda));
  }
};