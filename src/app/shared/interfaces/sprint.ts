import { Usuario } from "./usuario";
import { Subida } from "./subida";

export interface Sprint {
    fechaInicio?: Date;
    fechaFin?: Date;
    responsable?: Usuario;
    subidas?: Subida[];
}