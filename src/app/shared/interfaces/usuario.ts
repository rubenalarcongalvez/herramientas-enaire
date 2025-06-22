export interface Usuario {
    id: string,
    // token: string,
    // email?: string,
    nombre: string,
    alias: string, // Mote carinoso
    cumpleanos: Date,
    cumpleanosStr: string // Solo para el front
}