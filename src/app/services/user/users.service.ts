import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { UsersI } from 'src/app/models/userss.models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private storageKeyUser = 'users';

  constructor() {}

  async getUsers(): Promise<Array<UsersI>> {
    const user = localStorage.getItem(this.storageKeyUser);
    return user ? JSON.parse(user) : [];
  }

  async createUsers(user: UsersI): Promise<UsersI> {
    const users = await this.getUsers();
    user.id_user = uuidv4(); // Generar un ID único
    users.push(user);
    this.saveToStorage(users);
    return user;
  }

  async editUsers(id: string, updatedUser: UsersI): Promise<UsersI> {
    const users = await this.getUsers();
    const index = users.findIndex((stat) => stat.id_user === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      this.saveToStorage(users);
      return users[index];
    }
    throw new Error('Usuario no encontrado');
  }

  async deleteUser(id: string): Promise<void> {
    const user = (await this.getUsers()).filter((stat) => stat.id_user !== id);
    this.saveToStorage(user);
  }

  private saveToStorage(users: Array<UsersI>): void {
    localStorage.setItem(this.storageKeyUser, JSON.stringify(users));
  }
}


