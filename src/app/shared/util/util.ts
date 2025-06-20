import { Timestamp } from "@angular/fire/firestore";

export function obtenerFechaString(fecha: Date | Timestamp): string {
  const d: Date = fecha instanceof Date ? fecha : fecha.toDate();

  const dia  = d.getDate().toString().padStart(2, '0');
  const mes  = (d.getMonth() + 1).toString().padStart(2, '0'); // +1 porque Enero = 0
  const año  = d.getFullYear();

  return `${dia}/${mes}/${año}`;
}