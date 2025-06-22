import { Subida } from "./subida";

export interface Sprint {
    fechaInicio?: Date;
    fechaFin?: Date;
    subidas?: Subida[];
}