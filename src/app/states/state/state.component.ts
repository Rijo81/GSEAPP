import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonLabel, IonModal, IonButton, IonItem,
  IonInput, IonSearchbar, IonList, IonIcon, IonFab, IonFabButton, IonMenuButton, IonPopover, IonAvatar } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, create, trash, ellipseOutline, logOutOutline, keyOutline } from 'ionicons/icons';
import { StateI } from 'src/app/models/state.models';
import { StatesService } from 'src/app/services/crud/states.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { PopoverController } from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { UserMenuComponent } from 'src/app/components/user-menu/user-menu.component';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss'],
  standalone: true,
  imports: [ IonAvatar, IonPopover, IonFabButton, IonFab, IonIcon, IonList, IonSearchbar, IonInput, IonItem, IonButton, IonModal,
    IonLabel, IonContent, IonButtons, IonTitle, IonToolbar, IonHeader, IonMenuButton, FormsModule, CommonModule,
  ReactiveFormsModule ]
})
export class StateComponent  implements OnInit {

    state: StateI[] = [];
    newState:  StateI = { name: '' };
    isEditing = false;
    editingStateId: string | null = null;
    filteredStates: StateI[] = []; // Lista filtrada de usuarios
    searchForm!: FormGroup;
    userPhoto: string = '';
    showUserMenu = false;

    @ViewChild('modalCreate') modal!: IonModal;
    @ViewChild('modalUpdate') modalEdit!: IonModal;

    constructor(private stateService: StatesService,
                private interactionService: InteractionService,
                private router: Router,
                private popoverCtrl: PopoverController,
                private supabaseService: SupabaseService,
                ) {
      addIcons({logOutOutline,keyOutline,trash,create,add,ellipseOutline});
    }
    async ngOnInit() {
      this.searchForm = new FormGroup({
        search: new FormControl('')
      });
      //this.loadUsers();
        this.stateService.getStates().subscribe(state => {
        this.state = state;
        this.filteredStates = state; // Al inicio, la lista filtrada es igual a la original
      });

      // Detectar cambios en el campo de búsqueda y filtrar usuarios
      this.searchForm.get('search')?.valueChanges.subscribe(value => {
        this.filterState(value);
        console.log(value);
        console.log(this.filterState(value));

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
    // Función para filtrar los usuarios
    filterState(searchTerm: string) {
      console.log('Dentro del metodo: ', searchTerm);

      if (!searchTerm) return [];

      const lowerCaseSearch = searchTerm.toLowerCase();
        this.filteredStates = this.state.filter(user =>{
          user.name.toLowerCase().includes(lowerCaseSearch)
        });

      return this.filteredStates;
    }

    openModalEdit() {
      this.modalEdit.present(); // Muestra el primer modal
    }

    openModalCreate() {
      this.modal.present(); // Muestra el primer modal
    }

    cancelModalCreate() {
      this.modal.dismiss(null, 'cancel');
    }
    cancelModalUpdate() {
      this.modalEdit.dismiss(null, 'cancel');
    }

    loadState() {
      this.stateService.getStates().subscribe(state => {
        this.state = state;
      });
    }
   async addState() {
    this.interactionService.showLoading("Creando estado");
    this.stateService.addState(this.newState).subscribe({
      next: () => {
        this.newState = { name: '' };
        this.loadState();
        this.modal.dismiss(this.newState, 'confirm');
        this.interactionService.dismissLoading();
        this.interactionService.showToast('Estado creado con éxito');
      },
      error: (err) => {
        this.interactionService.dismissLoading();
        this.interactionService.showToast('Error al crear estado: ' + err.message);
      }
    });
    }
    editState(state: StateI) {
      this.isEditing = true;
      this.editingStateId = state.id!;
      this.newState = { ...state };
      console.log('estamos dentro', this.newState);
      this.modalEdit.present();

    }
    async updateState() {
      this.interactionService.showLoading("Actualizando...");
      this.stateService.updateState(this.editingStateId, this.newState).subscribe({
        next: () => {
          this.isEditing = false;
          this.editingStateId = null;
          this.newState = { name: '' };
          this.loadState();
          this.interactionService.dismissLoading();
          this.modalEdit.dismiss(this.newState, 'confirm');
          this.interactionService.showToast('Estado actualizado');
        },
        error: (err) => {
          this.interactionService.dismissLoading();
          this.interactionService.showToast('Error al actualizar estado: ' + err.message);
        }
      });
    }
    async deleteState(id: string) {
      const responseAlert = await this.interactionService.presentAlert('Eliminar Estado',
        `Esta seguro de eliminar el <strong>Estado</strong>`,
      'Cancelar');

      if( responseAlert){
        try {
          this.interactionService.showLoading("Eliminando...");
          this.stateService.deleteUser(id).subscribe(() => {
            this.loadState();
            this.interactionService.dismissLoading();
          });
          this.interactionService.showToast('Estado eliminado');
        }
        catch(err){
          this.interactionService.dismissLoading();
          this.interactionService.showToast('Error: ' + err);
        }
      }
    }
    changePassword(){
      this.router.navigate(['/changed-pass']);
    }

}
