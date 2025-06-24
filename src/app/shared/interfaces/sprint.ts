import { Subida } from "./subida";

export interface Sprint {
    id?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
    subidas?: Subida[];
}