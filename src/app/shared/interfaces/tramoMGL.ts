import { Usuario } from "./usuario";

export interface TramoMGL {
    id: string;
    tramo: Date[];
    usuariosEncargados: Usuario[];
}