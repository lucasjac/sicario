import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private angularFirestore: AngularFirestore) { }

  public create(coleccion, datos)
  {
    return this.angularFirestore.collection(coleccion).add(datos);
  }

  public getList(coleccion)
  {
    return this.angularFirestore.collection(coleccion).snapshotChanges();
  }

  public get(coleccion, id)
  {
    return this.angularFirestore.collection(coleccion).doc(id).snapshotChanges();
  }

  public update(coleccion, id, datos)
  {
    return this.angularFirestore.collection(coleccion).doc(id).set(datos);
  }

  public delete(coleccion, id)
  {
    return this.angularFirestore.collection(coleccion).doc(id).delete();
  }
}
