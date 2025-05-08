import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { StateI } from 'src/app/models/state.models';
// import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
// import { from, Observable } from 'rxjs';
// import { StateI } from 'src/app/models/state.models';

@Injectable({
  providedIn: 'root'
})
export class StatesService {

  // Obtener todos los estados
  getStates(): Observable<StateI[]> {
    return from(supabase.from('states').select('*').then(({ data }) => data as StateI[]));
  }

  // Agregar un estado
  addState(state: StateI): Observable<any> {
    return from(supabase.from('states').insert([state]));
  }

  // Actualizar un estado
  updateState(id: string, state: Partial<StateI>): Observable<any> {
    return from(supabase.from('states').update(state).eq('id', id));
  }

  // Eliminar un estado
  deleteUser(id: string): Observable<any> {
    return from(supabase.from('states').delete().eq('id', id));
  }

  async getInitialState(): Promise<string | null> {
    const { data, error } = await supabase
      .from('states')
      .select('id')
      .eq('name', 'Pendiente')  // 👈 o el nombre de tu estado inicial
      .maybeSingle();

    if (error) {
      console.error('❌ Error al buscar estado inicial:', error.message);
      return null;
    }

    return data?.id ?? null;
  }
}
