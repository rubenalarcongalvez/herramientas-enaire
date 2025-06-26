import { EntornoEnum } from "../enums/entorno";
import { TipoElementoEnum } from "../enums/tipo-elemento";
import { UsuarioSimple } from "./usuario";

export interface Subida {
    entorno: EntornoEnum;
    responsable: UsuarioSimple;
    fechaSubida?: Date;
    horaSubida?: Date;
    idReferencia?: string; // ID de referencia de la subida pedida
    elementosSubida?: ElementoSubida[]
}

export interface ElementoSubida {
    tipo: TipoElementoEnum; // dist, war, ear...
    moduloSubido: string;
    completado: boolean;
    usuariosSubida?: UsuarioSimple[] | null;
}
