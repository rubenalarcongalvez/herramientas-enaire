import { Entorno } from "../enums/entorno";
import { TipoElemento } from "../enums/tipo-elemento";
import { Usuario } from "./usuario";

export interface Subida {
    entorno: Entorno;
    fechaSubida?: Date;
    elementosSubidos?: ElementoSubido[]
}

export interface ElementoSubido {
    tipo: TipoElemento; // dist, war, ear...
    moduloSubido: string;
    completado: boolean;
    usuariosSubida?: Usuario[];
}
