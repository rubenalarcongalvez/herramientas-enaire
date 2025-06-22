import { Timestamp } from "@angular/fire/firestore";
import { Usuario } from "../interfaces/usuario";

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
  const mesCapitalizado = mes.charAt(0).toLocaleUpperCase('es-ES') + mes.slice(1);

  return `${dia} de ${mesCapitalizado}`;
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

export function esDiaLibre(usuario: Usuario | null | undefined, fechaActual: Date | Timestamp | null | undefined): boolean {
  if (!usuario || !fechaActual) return false;
  
  const fecha = fechaActual instanceof Date ? fechaActual
                                            : (fechaActual as Timestamp).toDate();

  // Comprueba en cualquier colección de ausencias
  const enAusencia = (usuario.vacaciones ?? []).some(d => esMismoDia(d, fecha)) ||
                     (usuario.asuntosPropios ?? []).some(d => esMismoDia(d, fecha)) ||
                     (usuario.enfermedad     ?? []).some(d => esMismoDia(d, fecha)) ||
                     (usuario.otrasAusencias ?? []).some(d => esMismoDia(d, fecha));

  return enAusencia;
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

/**
 * Une un array de elementos usando «, » y la conjunción final («y» por defecto).
 *
 * @param items       Elementos a concatenar.
 * @param toString    Función opcional para convertir cada ítem a string.
 * @param conj        Conjunción final (por defecto "y").
 * @param sep         Separador intermedio (por defecto ",").
 * @returns           Cadena formateada:  "", "Ana", "Ana y Luis", "Ana, Bea y Luis"
 */
export function joinConY<T>(items: T[], toString: (item: T) => string = String, conj = 'y', sep = ', '): string {
  const strs = items.map(toString).filter(Boolean);
  const n = strs.length;

  if (n === 0) return '';
  if (n === 1) return strs[0];
  if (n === 2) return `${strs[0]} ${conj} ${strs[1]}`;

  return `${strs.slice(0, -1).join(sep)} ${conj} ${strs[n - 1]}`;
}

/**
 * Convierte cualquier cosa que represente una fecha (Date, string ISO o timestamp)
 * al formato requerido por los calendarios “YYYY-MM-DD”.
 *
 * @param input  Fecha en formato Date | string | number
 * @returns      Cadena "2025-06-23" (ISO corto, sin zona horaria)
 */
export function adaptarFechaACalendario(
  input: Date | string | number
): string {
  // 1. Normaliza a Date
  const d = input instanceof Date ? input : new Date(input);

  // 2. Asegúrate de que es válida
  if (isNaN(d.getTime())) {
    throw new Error('Fecha no válida');
  }

  // 3. Formato YYYY-MM-DD con ceros delante
  const año  = d.getFullYear();
  const mes  = String(d.getMonth() + 1).padStart(2, '0'); // enero = 0
  const día  = String(d.getDate()).padStart(2, '0');

  return `${año}-${mes}-${día}`;
}