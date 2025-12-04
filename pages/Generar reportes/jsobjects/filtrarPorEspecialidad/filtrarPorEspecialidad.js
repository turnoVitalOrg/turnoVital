export default {
  filtrarPorEspecialidad: () => {
    // toma la selección, o "todas" si no hay selección
    const selected = dd_especialidad.selectedOptionValue || "todas";
    return selected;
  }
}
