import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { RolsI } from 'src/app/models/rols.models';
import { supabase } from 'src/app/core/supabase.client';

// import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
// import { from, Observable } from 'rxjs';
// import { RolsI } from 'src/app/models/rols.models';

@Injectable({
  providedIn: 'root'
})
export class RolsService {

  // Obtener todos los roles
  getRols(): Observable<RolsI[]> {
    return from(
      supabase.from('rols').select('*').then(({ data, error }) => {
        if (error) throw error;
        return data as RolsI[];
      })
    );
  }

  // Agregar rol
  addRol(rol: RolsI): Observable<any> {
    return from(
      supabase.from('rols').insert([rol]).then(({ error }) => {
        if (error) throw error;
      })
    );
  }

  // Editar rol
  updateRol(id: string, rol: Partial<RolsI>): Observable<any> {
    return from(
     supabase.from('rols').update(rol).eq('id', id).then(({ error }) => {
        if (error) throw error;
      })
    );
  }

  // Eliminar rol
  deleteRol(id: string): Observable<any> {
    return from(
      supabase.from('rols').delete().eq('id', id).then(({ error }) => {
        if (error) throw error;
      })
    );
  }
  // private rolsCollection = collection(this.firestore, 'rol');
  //     constructor(private firestore: Firestore) {}

  //     // Obtener todos los usuarios
  //     getRols(): Observable<RolsI[]> {
  //       return from(getDocs(this.rolsCollection).then(snapshot =>
  //         snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RolsI))
  //       ));
  //     }

  //     // Agregar usuario
  //     addRol(rol: RolsI): Observable<void> {
  //       return from(addDoc(this.rolsCollection, rol).then(() => {}));
  //     }

  //     // Editar usuario
  //     updateRol(id: string, rol: Partial<RolsI>): Observable<void> {
  //       const rolDoc = doc(this.firestore, `rol/${id}`);
  //       return from(updateDoc(rolDoc, rol));
  //     }

  //     // Eliminar usuario
  //     deleteRol(id: string): Observable<void> {
  //       const rolDoc = doc(this.firestore, `rol/${id}`);
  //       return from(deleteDoc(rolDoc));
  //     }
}
