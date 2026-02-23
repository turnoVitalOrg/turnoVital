export default {

  agenda: [],
  agendaOriginal: [],
  cambios: [],

  dias: [
    { value: "lunes", label: "Lunes" },
    { value: "martes", label: "Martes" },
    { value: "miercoles", label: "Miercoles" },
    { value: "jueves", label: "Jueves" },
    { value: "viernes", label: "Viernes" },
    { value: "sabado", label: "Sabado" },
    { value: "domingo", label: "Domingo" },
  ],

  hayCambios: false,

  async init() {
    const profId = appsmith.URL.queryParams.id;

    if (!profId) {
      showAlert("Falta el parámetro id en la URL", "warning");
      return;
    }

    const agendaRows = await listarAgenda.run({ id: profId });

    this.agenda = agendaRows || [];
    this.agendaOriginal = JSON.parse(JSON.stringify(this.agenda));
    this.cambios = [];
    this.hayCambios = false;
  },

  async onDelete(id) {
    const indexDelete = this.agenda.findIndex(a => a.id == id);
    if (indexDelete !== -1) {
      this.agenda.splice(indexDelete, 1);
      this.hayCambios = true;
    }
  },

  async onSave(data) {
    this.agenda.push({
      id: "nuevo_" + Date.now(),
      ...data
    });
    this.hayCambios = true;
  },

  async onChange(updateRow) {
    this.agenda = this.agenda.map(a =>
      a.id == updateRow.id ? updateRow : a
    );
    this.hayCambios = true;
  },

  async onSubmit() {

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
      if (!original) return false;
      return JSON.stringify(original) !== JSON.stringify(a);
    });

    this.cambios = [
      ...nuevos.map(n => ({ tipo: "nuevo", data: n })),
      ...eliminados.map(e => ({ tipo: "eliminado", data: e })),
      ...editados.map(ed => ({ tipo: "editado", data: ed })),
    ];

    const agendaProcesada = actuales.map(a => {
      if (String(a.id).startsWith("nuevo_")) {
        const { id, ...rest } = a;
        return rest;
      }
      return { ...a };
    });

    // 🔥 ESTA ES LA PARTE IMPORTANTE
    await sincronizarAgenda.run({
      profesionalId: appsmith.URL.queryParams.id,
      agenda: agendaProcesada
    });

    showAlert("Cambios guardados correctamente", "success");

    this.agendaOriginal = JSON.parse(JSON.stringify(this.agenda));
    this.hayCambios = false;
  },

  getCambiosParaExportar() {
    return this.cambios;
  }
};