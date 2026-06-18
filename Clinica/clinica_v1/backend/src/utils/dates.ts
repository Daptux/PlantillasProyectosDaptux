/**
 * Utilidades de fechas/horas para la agenda medica.
 * Formato MySQL DATETIME: 'YYYY-MM-DD HH:mm:ss'
 */

export function toMySqlDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/** Devuelve el dia de la semana 0=Domingo ... 6=Sabado. */
export function dayOfWeek(date: Date): number {
  return date.getDay();
}

/** Comprueba si dos rangos [aIni,aFin) y [bIni,bFin) se solapan. */
export function rangesOverlap(aIni: Date, aFin: Date, bIni: Date, bFin: Date): boolean {
  return aIni < bFin && bIni < aFin;
}
