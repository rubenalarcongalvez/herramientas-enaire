import { Injectable, signal } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore, getDoc, limit, orderBy, query, setDoc, where } from '@angular/fire/firestore';
import { Usuario } from '../interfaces/usuario';
import { map, Observable } from 'rxjs';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  sprintSeleccionado = signal<number | null>(null);
  usuarios = signal<Usuario[]>([]);

  constructor(private firestore: Firestore) {}

  clean(): void {
    window.localStorage.clear();
  }

  public saveUser(user: Usuario): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): Usuario | null {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user) as Usuario;
    }

    return null;
  }

  public isLoggedIn(): boolean {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return true;
    }

    return false;
  }

  /*=============================================
  =            Database management            =
  =============================================*/

  async existeDocumento(ruta: string): Promise<boolean> {
    const [coleccion, id] = ruta.split('/');
    if (!coleccion || !id) {
      throw new Error('Contraseña incorrecta');
    }
  
    const ref = doc(this.firestore, coleccion, id);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  /**
   * Devuelve el nº del sprint “más nuevo” cuyo fechaInicio sea <= fechaActual.
   */
  obtenerNumeroUltimoSprint(
    contrasenaAcceso: string,
    fechaActual: Date
  ): Observable<number | null> {
    const ruta = `herramientas-enaire/${contrasenaAcceso}/sprints`;
    const sprintsRef = collection(this.firestore, ruta);
  
    // Ultimo sprint por fechaInicio
    const q = query(
      sprintsRef,
      where('fechaInicio', '<=', fechaActual),
      orderBy('fechaInicio', 'desc'),
      limit(1)
    );
  
    // Observable que emite el nº o null
    return collectionData(q, { idField: 'id' }).pipe(
      map(docs => {
        if (!docs.length) return null;
        const doc = docs[0] as any;
        return Number(doc.id);
      })
    );
  }

  /* Obtener el documento con cambios a tiempo real */
  getDocumentByAdress(url: string): Observable<any> {
    const ruta = `herramientas-enaire/${url}`;

    const ref = doc(this.firestore, ruta);

    return docData(ref) as Observable<any>;
  }

  /* Obtener todos los documentos de una coleccion con cambios a tiempo real */
  getCollectionByAdress<T>(url: string): Observable<T[]> {
    const ruta = `herramientas-enaire/${url}`;
    return collectionData(collection(this.firestore, ruta)) as Observable<T[]>;
  }

  /**
   * @description Crear o modificar un documento por direccion
   */
  setDocumentByAddress(address: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, address);
    return setDoc(docRef, data);
  }
  
  /*=====  Final de Database management  ======*/
}
