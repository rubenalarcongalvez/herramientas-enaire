import { computed, Injectable, signal } from '@angular/core';
import { collection, collectionData, deleteDoc, doc, docData, documentId, Firestore, getDoc, orderBy, query, setDoc, Timestamp } from '@angular/fire/firestore';
import { Usuario } from '../interfaces/usuario';
import { map, Observable } from 'rxjs';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  numerosSprints = signal<number[]>([]);
  sprintSeleccionado = signal<number | null>(null);
  usuarios = signal<Usuario[]>([]);
  usuariosNoExentos = computed(() => this.usuarios().filter(usu => !usu?.exentoSubidas));
  limiteSprintsContarSubidas: number = 3;
  limiteSprintsVecesResponsable: number = 5;

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
   * Devuelve los numeros de sprint de mas nuevo a menos nuevo
   */
  obtenerNumerosSprints(url: string): Observable<number[]> {
    const colRef = collection(this.firestore, `herramientas-enaire/${url}/sprints`);
    return collectionData(colRef, { idField: 'id' }).pipe(
      map(docs =>
        docs
          .map(d => Number((d as any).id))
          .filter(n => !isNaN(n))
          .sort((a, b) => b - a) // Ordenar numéricamente de mayor a menor
      )
    );
  }

  /* Obtener el documento con cambios a tiempo real */
  getDocumentByAddress(url: string): Observable<any> {
    const ruta = `herramientas-enaire/${url}`;
    const ref = doc(this.firestore, ruta);
  
    return docData(ref, { idField: 'id' }).pipe(
      map((data: any) => this.tsToDate(data))
    );
  }

  /* Obtener todos los documentos de una coleccion con cambios a tiempo real */
  getCollectionByAddress<T>(url: string): Observable<T[]> {
    const ruta = `herramientas-enaire/${url}`;
    return collectionData(collection(this.firestore, ruta), { idField: 'id' }).pipe(
      map(docs => docs.map(d => this.tsToDate(d) as T))
    );
  }

  /**
   * @description Crear o Modificar un documento por direccion
   */
  setDocumentByAddress(url: string, data: any, editar: boolean = false): Promise<void> {
    let ruta = `herramientas-enaire/${url}`;
  
    if (editar) {
      const docRef = doc(this.firestore, ruta);
      return setDoc(docRef, data, { merge: true }); // merge para que solo actualice, no setee directamente todo
    } else if (data?.id) {
      // Si hay ID, actualiza documento por su ID
      ruta += data.id;
      const docRef = doc(this.firestore, ruta);
      return setDoc(docRef, data, { merge: true }); // merge para que solo actualice, no setee directamente todo
    } else {
      // Si no hay ID, crea uno nuevo en la colección y le mete el id
      const colRef = collection(this.firestore, ruta);
  
      const nuevoDocRef = doc(colRef);
      const dataConId = { ...data, id: nuevoDocRef.id };
  
      return setDoc(nuevoDocRef, dataConId);
    }
  }

  /**
   * Elimina el documento cuyo id = `docId` dentro de la colección indicada.
   * @param url   Ruta relativa a la colección
   * @param docId ID del documento a borrar
   */
  deleteDocumentById(url: string, docId: string): Promise<void> {
    const ruta = `herramientas-enaire/${url}/${docId}`;
    const ref  = doc(this.firestore, ruta);

    return deleteDoc(ref);
  }
  
  /*=====  Final de Database management  ======*/

  /**
   * Convierte recursivamente todos los Timestamp → Date
   */
  private tsToDate(obj: any): any {
    if (obj === null || obj === undefined) return obj;
  
    if (obj instanceof Timestamp) {
      return obj.toDate();
    }
  
    if (Array.isArray(obj)) {
      return obj.map((item) => this.tsToDate(item));
    }
  
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = this.tsToDate(obj[key]);
        }
      }
      return result;
    }
  
    return obj;
  }
}
