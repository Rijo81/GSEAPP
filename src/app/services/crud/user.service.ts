import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { Models } from 'src/app/models/models';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Obtener todos los usuarios
  getUsers(): Observable<Models.User.UsersI[]> {
    return from(this.fetchUsers());
  }
  private async fetchUsers(): Promise<Models.User.UsersI[]> {
    const { data, error } = await supabase
      .from('usersapp')
      .select('*,  group_id(name)');
    if (error) throw error;
    console.log('[Supabase] Data cargada:', data);
    return data as Models.User.UsersI[];
  }

  // Agregar usuario
  addUser(user: Models.User.UsersI): Observable<void> {
    return from(
      supabase
        .from('usersapp')
        .insert([user])
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  // // Editar usuario
  // updateUser(id: string, user: any): Observable<void> {
  //   return from(
  //     supabase
  //       .from('usersapp')
  //       .update(user)
  //       .eq('id', id)
  //       .then(({ error }) => {
  //         if (error) throw error;
  //       })
  //   );
  // }

  updateUser(id: string, user: Partial<Models.User.UsersI>): Observable<void> {
    const updatedUser = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      group_id: typeof user.group_id === 'object' ? user.group_id.id : user.group_id,
    };

    return from(
      supabase
        .from('usersapp')
        .update(updatedUser)
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }


  // Eliminar usuario
  deleteUser(id: string): Observable<void> {
    return from(
      supabase
        .from('usersapp')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }
}
