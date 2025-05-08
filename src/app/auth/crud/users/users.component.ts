import { Component, OnInit, ViewChild } from '@angular/core';
import { Models } from 'src/app/models/models';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonIcon,
  IonFab,
  IonFabButton,
  IonMenuButton,
  IonButton,
  IonModal,
  IonSearchbar,
  IonInput,
  IonText,
  IonSelect,
  IonSelectOption,
  IonPopover,
  PopoverController,
} from '@ionic/angular/standalone';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  create,
  trash,
  add,
  createOutline,
  trashOutline, logOutOutline, keyOutline } from 'ionicons/icons';
import { InteractionService } from 'src/app/services/interaction.service';
import { GroupsI } from 'src/app/models/groups.models';
import { GroupService } from 'src/app/services/crud/group.service';
import { UserService } from 'src/app/services/crud/user.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [
    IonPopover,
    IonText,
    IonInput,
    IonModal,
    IonButton,
    IonIcon,
    IonItem,
    IonList,
    IonLabel,
    IonContent,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonMenuButton,
    FormsModule,
    CommonModule,
    IonFab,
    IonFabButton,
    ReactiveFormsModule,
    IonSelectOption,
    IonAvatar,
    IonSelect,
  ],
})
export class UsersComponent implements OnInit {
  users: Models.User.UsersI[] = [];
  groups: GroupsI[] = [];
  newUser: Models.User.UsersI = this.getDefaultUsers();
  newUsers: {
    name: '',
    email: '',
    group_id: '',
    photo: '',
    phone: '',
  };
  photo: File | null = null;
  isEditing = false;
  editingUserId: string | null = null;
  //BUSQUEDA // Lista original de usuarios
  filteredUsers: Models.User.UsersI[] = []; // Lista filtrada de usuarios
  selectedPhoto: File | null = null;

  userPhoto: string = '';
  showUserMenu = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedPhoto = file;
  }

  @ViewChild('modalCreate') modal!: IonModal;
  @ViewChild('modalUpdate') modalEdit!: IonModal;

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private supabaseService: SupabaseService,
    private interactionService: InteractionService,
    private router: Router,
    private popoverCtrl: PopoverController
  ) {
    addIcons({logOutOutline,keyOutline,create,trash,add,createOutline,trashOutline});
  }

  async ngOnInit() {
    this.loadGroups();
    this.loadUsers();
    this.userPhoto = await this.supabaseService.loadPhoto();
  }

  logout() {
    this.supabaseService.signOut();
    this.router.navigate(['/auth']);
  }

  changePassword(){
    this.router.navigate(['/changed-pass']);
  }
  filterUsers(searchTerm: string) {
    if (!searchTerm) {
      this.filteredUsers = this.users;
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerCaseSearch) ||
        user.email.toLowerCase().includes(lowerCaseSearch)
    );
  }
  openModalEdit() {
    this.modalEdit.present(); // Muestra el primer modal
  }

  openModalCreate() {
    this.resetForm();
    this.modal.present(); // Muestra el primer modal
  }

  cancelModalCreate() {
    this.modal.dismiss(null, 'cancel');
  }
  cancelModalUpdate() {
    this.modalEdit.dismiss(null, 'cancel');
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.interactionService.showToast('Error al cargar usuarios');
      },
    });
  }

  loadGroups() {
    this.groupService.getGroups().subscribe({
      next: (group) => {
        this.groups = group;
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.interactionService.showToast('Error al cargar grupos');
      },
    });
  }

  compareGroups =  (g1: any, g2: any): boolean => {
    return g1 && g2 ? g1.id === g2.id : false;
  };
  getDefaultUsers(): Models.User.UsersI {
    return {
      name: '',
      email: '',
      group_id: {
        id: '',
        name: '',
        parentId: '',
        permition_states: false,
        permition_groups: false,
        permition_users: false,
        permition_typerequests: false,
        permition_requests: false,
        permition_viewsolic: false,
      },
      photo: '',
      phone: '',
    };
  }
  uploadPhoto(event: any) {
    this.photo = event.target.files[0];
  }

  resetForm() {
    this.newUser = {
      id: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      group_id: {
        id: '',
        name: '',
        parentId: '',
        permition_states: false,
        permition_groups: false,
        permition_users: false,
        permition_typerequests: false,
        permition_requests: false,
        permition_viewsolic: false,
      },
      photo: '',
    };
    this.photo = null;
    this.selectedPhoto = null;
  }
  getGroupNameById(id: string): string {
    const group = this.groups.find((g) => g.id === id);
    return group ? group.name : 'Sin grupo';
  }
  async addUser() {
    if (!this.photo) {
      this.interactionService.showToast('Debes seleccionar una foto 📸');
      return;
    }
    try {
      this.interactionService.showLoading();
      await this.supabaseService.signUp(
        this.newUser.name,
        this.newUser.email,
        this.newUser.phone,
        this.newUser.password,
        this.newUser.group_id,
        this.photo
      );
      this.interactionService.dismissLoading();
      this.loadUsers();
      this.modal.dismiss(); // 🔒 Cierra el modal
      this.resetForm(); // 🔄 Limpia el formulario
      this.interactionService.showToast('Usuario registrado con éxito ✅');
      console.log('Registro exitoso');
    } catch (error) {
      console.error(error);
      this.interactionService.showToast('Error al registrar usuario ❌');
    }
  }
  editUser(user: Models.User.UsersI) {
    this.isEditing = true;
    this.newUser = { ...user };
    this.editingUserId = user.id!;

    const groupId = user.group_id as any;
    if (typeof groupId === 'string') {
      const group = this.groups.find(g => g.id === groupId);
      if (group) {
        this.newUser.group_id = group;
      } else {
        console.warn('⚠️ No se encontró el grupo con id:', groupId);
      }
    } else {
      this.newUser.group_id = user.group_id;
    }
    this.modalEdit.present(); // Muestra el modal
  }

  async updateUser() {
    if (!this.editingUserId) return;

    const userToUpdate: Partial<any> = {
      name: this.newUser.name,
      email: this.newUser.email,
      phone: this.newUser.phone,
      photo: this.newUser.photo,
      group_id: typeof this.newUser.group_id === 'string'
            ? this.newUser.group_id
            : this.newUser.group_id.id
    };
    console.log('🆔 ID del usuario que se va a editar:', this.editingUserId);
    console.log('Esto es userToUpadate: ', userToUpdate);

    this.userService.updateUser(this.editingUserId, userToUpdate).subscribe({
      next: () => {
        this.loadUsers();
        this.modalEdit.dismiss();
        this.interactionService.showToast('✅ Usuario actualizado');
      },
      error: (err) => {
        console.error(err);
        this.interactionService.showToast('❌ Error al actualizar usuario');
      }
    });
  }

  async deleteUser(id: string) {
    const confirm = await this.interactionService.presentAlert(
      'Eliminar Usuario',
      '¿Estás seguro de eliminar este usuario?',
      'Cancelar'
    );
    console.log('Este es el id de ELIMINAR: ', id);

    if (confirm) {
      await this.interactionService.showLoading('Eliminando...');
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          this.interactionService.showToast('Usuario eliminado');
        },
        error: (err) => {
          this.interactionService.showToast('Error al eliminar usuario');
          console.error(err);
        },
        complete: () => this.interactionService.dismissLoading(),
      });
    }
  }
}
