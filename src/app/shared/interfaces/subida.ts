import { EntornoEnum } from "../enums/entorno";
import { TipoElementoEnum } from "../enums/tipo-elemento";
import { Usuario } from "./usuario";

export interface Subida {
    entorno: EntornoEnum;
    fechaSubida?: Date;
    responsable?: Usuario;
    idReferencia?: string; // ID de referencia de la subida pedida
    elementosSubida?: ElementoSubida[]
}

export interface ElementoSubida {
    tipo: TipoElementoEnum; // dist, war, ear...
    moduloSubido: string;
    completado: boolean;
    usuariosSubida?: Usuario[];
}
