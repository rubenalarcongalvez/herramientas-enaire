import { Modulo } from "./modulo"

export interface Usuario {
    id: string,
    // token: string,
    // email?: string,
    nombre: string,
    alias: string, // Mote carinoso
    cumpleanos: Date,
    exentoSubidas: boolean, // Si el usuario no tiene que subir nada (clientes ENAIRE por ejemplo)

    vacaciones: Date[],
    asuntosPropios: Date[],
    enfermedad: Date[],
    otrasAusencias: Date[],

    /* Hay que traerse los datos de otra parte */
    /* Usar la variable limiteSprintsContarSubidas storage.service */
    distsUltimosSprints: number,
    warsUltimosSprints: number,
    earsUltimosSprints: number,
    modulosLider: Modulo[],
    modulosDesarrollador?: Modulo[],
    /* Usar la variable limiteSprintsVecesResponsable de storage.service */
    vecesResponsableUltimosSprints: number
    vecesMGLUltimosSprints: number

    cumpleanosStr: string // Solo para el front
}

/* Para guardar la referencia en BBDD sin referencias ciclicas */
export interface UsuarioSimple {
    id: string,
    // token: string,
    // email?: string,
    nombre: string,
    alias: string, // Mote carinoso
    cumpleanos: Date,
    exentoSubidas: boolean, // Si el usuario no tiene que subir nada (clientes ENAIRE por ejemplo)
}