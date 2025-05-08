import { Injectable } from '@angular/core';
import { from, map, Observable, retry } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { TypeRI } from 'src/app/models/requests.models';
// import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
// import { from, Observable } from 'rxjs';
// import { TypeRequestsI, TypeRI } from 'src/app/models/requests.models';

@Injectable({
  providedIn: 'root'
})
export class TRequestsService {

  private table = 'typerequests';

  constructor() {}

  getTypeRequests(): Observable<TypeRI[]> {

    return from(
      supabase
        .from(this.table)
        .select('*')
        .order('created_at', { ascending: false })    // 🔥 Aquí
        .then(({ data, error }) => {
          if (error) throw error;
          return data as TypeRI[];
        })
    );
  }

  addTypeRequests(typeR: TypeRI): Observable<void> {
    return from(
      supabase.from(this.table)
        .insert([typeR])
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  updateTypeRequests(id: string, typeR: Partial<TypeRI>): Observable<void> {
    return from(
      supabase.from(this.table)
        .update(typeR)
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  deleteTypeRequests(id: string): Observable<void> {
    return from(
      supabase.from(this.table)
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  // private typeRequestsCollection = collection(this.firestore, 'typerequests');
  //     constructor(private firestore: Firestore) {}

  //     // Obtener todos los usuarios
  //     getTypeRequests(): Observable<TypeRI[]> {
  //       return from(getDocs(this.typeRequestsCollection).then(snapshot =>
  //         snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TypeRI))
  //       ));
  //     }

  //     // Agregar usuario
  //     addTypeRequests(typeR: TypeRI): Observable<void> {
  //       return from(addDoc(this.typeRequestsCollection, typeR).then(() => {}));
  //     }

  //     // Editar usuario
  //     updateTypeRequests(id: string, typeR: Partial<TypeRequestsI>): Observable<void> {
  //       const typeRDoc = doc(this.firestore, `typerequests/${id}`);
  //       return from(updateDoc(typeRDoc, typeR));
  //     }

  //     // Eliminar usuario
  //     deleteTypeRequests(id: string): Observable<void> {
  //       const typeRDoc = doc(this.firestore, `typerequests/${id}`);
  //       return from(deleteDoc(typeRDoc));
  //     }
}
