import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { Usuario } from '../interfaces/usuario';
import { from, map, Observable } from 'rxjs';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
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

   
  
  /*=====  Final de Database management  ======*/
}
