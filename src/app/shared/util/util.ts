import { Timestamp } from "@angular/fire/firestore";

export function obtenerFechaString(fecha: Date | Timestamp): string {
  if (!fecha) {
    return '';
  }

  const d: Date = fecha instanceof Date ? fecha : fecha.toDate();

  const dia  = d.getDate().toString().padStart(2, '0');
  const mes  = (d.getMonth() + 1).toString().padStart(2, '0'); // +1 porque Enero = 0
  const año  = d.getFullYear();

  return `${dia}/${mes}/${año}`;
}

export function obtenerFechaCumpleString(fecha: Date | Timestamp): string {
  if (!fecha) {
    return '';
  }

  const d: Date = fecha instanceof Date ? fecha : fecha?.toDate();

  const dia  = d.getDate().toString().padStart(2, '0');
  const mes  = d.toLocaleString('es-ES', { month: 'long' });

  return `${dia} de ${mes}`;
}

export function esMismoDia(a: Date | Timestamp | undefined | null, b: Date | Timestamp | undefined | null): boolean {
  if (!a && !b) {
    return true;
  } else if (!a || !b) {
    return false;
  }

  // Normaliza a Date.
  const d1: Date = a instanceof Date ? a : a.toDate();
  const d2: Date = b instanceof Date ? b : b.toDate();

  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export function esMismoDiaCumple(a: Date | Timestamp | undefined | null, b: Date | Timestamp | undefined | null): boolean {
  if (!a && !b) {
    return true;
  } else if (!a || !b) {
    return false;
  }

  // Normaliza a Date.
  const d1: Date = a instanceof Date ? a : a.toDate();
  const d2: Date = b instanceof Date ? b : b.toDate();

  return d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export function ponerFocusInputPrincipal() {
  setTimeout(() => {
    (document.querySelector('.inputPrincipal') as HTMLTextAreaElement)?.focus();
  }, 0);
}

export function normalizarCadena(cadena: string) {
    return String(cadena.toLowerCase()).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}