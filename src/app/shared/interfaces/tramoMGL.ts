import { Usuario } from "./usuario";

export interface TramoMGL {
    id: string;
    tramo: Date[];
    usuariosEncargados: Usuario[];

    fechaInicioDate: Date; // Solo para el front, para ordenar
}