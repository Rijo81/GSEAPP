import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonLabel,
  IonModal,
  IonButton,
  IonItem,
  IonInput,
  IonSearchbar,
  IonList,
  IonIcon,
  IonFab,
  IonFabButton,
  IonMenuButton,
  IonSelectOption,
  IonSelect,
  IonCheckbox, IonPopover, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, trash, logOutOutline, keyOutline } from 'ionicons/icons';
import { GroupsI } from 'src/app/models/groups.models';
import { GroupService } from 'src/app/services/crud/group.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { PopoverController } from '@ionic/angular/standalone';
import { UserMenuComponent } from 'src/app/components/user-menu/user-menu.component';
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  standalone: true,
  imports: [IonAvatar, IonPopover,
    IonFabButton,
    IonFab,
    IonIcon,
    IonList,
    IonSearchbar,
    IonInput,
    IonItem,
    IonButton,
    IonModal,
    IonLabel,
    IonContent,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonMenuButton,
    ReactiveFormsModule,
    FormsModule,
    IonSelectOption,
    CommonModule,
    IonSelect,
    IonCheckbox,
  ],
})
export class GroupsComponent implements OnInit {
  groups: GroupsI[] = [];
  filteredGroups: GroupsI[] = [];
  newGroup: GroupsI = {
    name: '',
    parentId: '',
    permition_states: false,
    permition_groups: false,
    permition_users: false,
    permition_typerequests: false,
    permition_requests: false,
    permition_viewsolic: false,
    permition_access_requests: false,
    permition_init_excuse: false,
    permition_init_request: false,
    permition_config: false
  };
  isEditing = false;
  editingGroupId: string | null = null;
  selectedGroup: string = '';
  searchForm!: FormGroup;
  userPhoto: string = '';
  showUserMenu = false;

  @ViewChild('modalCreate') modal!: IonModal;
  @ViewChild('modalUpdate') modalEdit!: IonModal;

  constructor(
    private groupService: GroupService,
    private interactionService: InteractionService,
    private supabaseService: SupabaseService,
    private router: Router,
    private popoverCtrl: PopoverController
  ) {
    addIcons({logOutOutline,keyOutline,trash,create,add});
  }

  async ngOnInit() {
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });

    this.loadGroup();

    this.searchForm.get('search')?.valueChanges.subscribe((value) => {
      this.filterGroup(value);
    });

    this.userPhoto =  await this.supabaseService.loadPhoto();
  }
  async openUserMenu(ev: Event) {
    const popover = await this.popoverCtrl.create({
      component: UserMenuComponent,
      event: ev,
      translucent: true,
      showBackdrop: true,
    });
    await popover.present();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.supabaseService.signOut();
    this.router.navigate(['/auth']);
  }

  changePassword(){
    this.router.navigate(['/changed-pass']);
  }
  filterGroup(searchTerm: string) {
    if (!searchTerm) {
      this.filteredGroups = this.groups;
      return;
    }

    const lower = searchTerm.toLowerCase();
    this.filteredGroups = this.groups.filter((group) =>
      group.name.toLowerCase().includes(lower)
    );
  }

  openModalCreate() {
    this.modal.present();
  }

  openModalEdit() {
    this.modalEdit.present();
  }

  cancelModalCreate() {
    this.modal.dismiss(null, 'cancel');
  }

  cancelModalUpdate() {
    this.modalEdit.dismiss(null, 'cancel');
  }

  loadGroup() {
    this.groupService.getGroups().subscribe({
      next: (group) => {
        console.log(group);

        this.groups = group;
        this.filteredGroups = group;
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.interactionService.showToast('Error al cargar grupos.');
      },
    });
  }

  async addGroup(formCreate: NgForm) {
    if (!this.newGroup.name.trim()) {
      this.interactionService.showToast('El nombre es obligatorio');
      return;
    }
    this.newGroup.parentId = this.selectedGroup;
    await this.interactionService.showLoading('Guardando...');
    this.groupService.addGroup(this.newGroup).subscribe({
      next: () => {
        console.log('datos padres: ', this.newGroup, this.selectedGroup);
        this.loadGroup();
        formCreate.resetForm();
        this.interactionService.dismissLoading();
        this.modal.dismiss(null, 'confirm');
        this.interactionService.showToast('Grupo creado con éxito');
      },
      error: (err) => {
        this.interactionService.dismissLoading();
        console.error('Error al agregar grupo:', err);
        this.interactionService.showToast('Error al crear grupo.');
      },
    });
  }

  editGroup(group: GroupsI) {
    this.isEditing = true;
    this.editingGroupId = group.id!;
    this.newGroup = { ...group };
    this.modalEdit.present();
  }

  async updateGroup() {
    if (!this.editingGroupId) return;

    if (!this.newGroup.name.trim()) {
      this.interactionService.showToast('El nombre es obligatorio');
      return;
    }

    await this.interactionService.showLoading('Actualizando...');
    this.groupService
      .updateGroup(this.editingGroupId, this.newGroup)
      .subscribe({
        next: () => {
          this.isEditing = false;
          this.editingGroupId = null;
          //this.newGroup = { name: '', parentId: this.selectedGroup };
          this.loadGroup();
          this.interactionService.dismissLoading();
          this.modalEdit.dismiss(null, 'confirm');
          this.interactionService.showToast('Grupo actualizado');
        },
        error: (err) => {
          this.interactionService.dismissLoading();
          console.error('Error al actualizar grupo:', err);
          this.interactionService.showToast('Error al actualizar grupo.');
        },
      });
  }

  async deleteGroup(id: string) {
    const confirmed = await this.interactionService.presentAlert(
      'Eliminar Grupo',
      '¿Estás seguro de que deseas eliminar este grupo?',
      'Cancelar'
    );

    if (!confirmed) return;

    await this.interactionService.showLoading('Eliminando...');
    this.groupService.deleteGroup(id).subscribe({
      next: () => {
        this.loadGroup();
        this.interactionService.dismissLoading();
        this.interactionService.showToast('Grupo eliminado');
      },
      error: (err) => {
        this.interactionService.dismissLoading();
        console.error('Error al eliminar grupo:', err);
        this.interactionService.showToast('Error al eliminar grupo.');
      },
    });
  }
}
