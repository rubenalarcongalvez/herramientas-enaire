import { Sprint } from "./sprint";
import { Usuario } from "./usuario";

export interface Proyecto {
    nombreProyecto: string;
    usuariosActuales: Usuario[];
    sprints: Sprint[];
}