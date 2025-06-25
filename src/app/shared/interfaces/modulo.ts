import { Usuario } from "./usuario";

export interface Modulo {
    id: string,
    nombre: string,
    gestores?: Usuario[],
    lider?: Usuario,
    desarrolladores?: Usuario[]

    liderStr?: string, // Solo para el front
}