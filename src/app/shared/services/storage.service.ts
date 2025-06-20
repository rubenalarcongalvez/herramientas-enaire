import { Injectable, signal } from '@angular/core';
import { doc, docData, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Usuario } from '../interfaces/usuario';
import { Observable, throwError } from 'rxjs';
import { Proyecto } from '../interfaces/proyecto';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  sprintSeleccionado = signal<number | null>(null);

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

  /* Obtener el documento con cambios a tiempo real */
  getDocumentByAdress(contrasenaAcceso: string): Observable<any> {
    const ruta = `herramientas-enaire/${contrasenaAcceso}`;

    const ref = doc(this.firestore, ruta);

    return docData(ref) as Observable<Proyecto>;
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
