import { Timestamp } from "@angular/fire/firestore";

export interface Usuario {
    // token: string,
    // email?: string,
    nombre: string,
    alias: string, // Mote carinoso
    cumpleanos: Date | string | Timestamp
}