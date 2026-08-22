// Semestre calendario, igual para Fedehockey y Fedepatín: meses 1-6 (UTC) -> S1,
// meses 7-12 (UTC) -> S2. Ver docs/superpowers/specs/2026-08-22-semester-selector-design.md
export function semesterOf(dateMs: number): string {
  const d = new Date(dateMs);
  const half = d.getUTCMonth() < 6 ? 1 : 2;
  return `${d.getUTCFullYear()}-S${half}`;
}

export function sortSemestersDesc(semesters: string[]): string[] {
  return Array.from(new Set(semesters)).sort().reverse();
}
