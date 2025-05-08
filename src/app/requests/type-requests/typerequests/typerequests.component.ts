import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonCardHeader,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonLabel,
  IonItem,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonMenuButton, IonPopover, IonAvatar, IonIcon, IonCol, IonRow, IonGrid } from '@ionic/angular/standalone';
import { delay, filter, retry, take, tap } from 'rxjs';
import { GroupI, GroupsI } from 'src/app/models/groups.models';
import { TypeRI } from 'src/app/models/requests.models';
import { GroupService } from 'src/app/services/crud/group.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { TRequestsService } from 'src/app/services/type-requests/t-requests.service';
import { PopoverController } from '@ionic/angular/standalone';
import { UserMenuComponent } from 'src/app/components/user-menu/user-menu.component';

@Component({
  selector: 'app-typerequests',
  templateUrl: './typerequests.component.html',
  styleUrls: ['./typerequests.component.scss'],
  standalone: true,
  imports: [ IonIcon, IonAvatar, IonPopover,
     IonButton,
        IonInput,
        IonItem,
        IonLabel,
        IonList,
        IonCardContent,
        IonCardTitle,
        IonCard,
        IonCardHeader,
        IonContent,
        IonTitle,
        IonButtons,
        IonToolbar,
        IonHeader,
        FormsModule,
        ReactiveFormsModule,
        IonSelect,
        IonSelectOption,
        IonMenuButton,
        CommonModule,

  ]
})
export class TyperequestsComponent  implements OnInit {

    typeRequestForm: FormGroup;
    typeRequests: TypeRI[] = [];
    groups: GroupsI[] = [];
    userPhoto: string = '';
    showUserMenu = false;
    showOptionsList: boolean[] = [];

    constructor(private fb: FormBuilder,
      private typeService: TRequestsService,
      private interactionService: InteractionService,
      private groupService: GroupService,
      private authSupabaseService: SupabaseService,
      private router: Router,
      private popoverCtrl: PopoverController

    ) {
      // Inicialización del formulario reactivo
      this.typeRequestForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        group_origin: [null, Validators.required],
        group_destine: [null, Validators.required],
        fields: this.fb.array([]),
      });
      this.loadTypeRequests();
    }

   async ngOnInit() {
    this.authSupabaseService.sessionChanged
        .pipe(
          filter(session => !!session),        // Espera a que la sesión esté lista
          take(1),                              // Solo la primera vez
          tap(() => console.log('Sesión lista')),
          delay(100),                           // Le das un respiro por si Supabase se toma su tiempo
          retry({ count: 3, delay: 1000 })      // Si falla, reintenta hasta 3 veces
        )
        .subscribe(() => {
          this.loadTypeRequests();
          this.loadGroup();
        });

        this.userPhoto =  await this.authSupabaseService.loadPhoto();
    }

      logout() {
        this.authSupabaseService.signOut();
        this.router.navigate(['/auth']);
      }

      changePassword(){
        this.router.navigate(['/changed-pass']);
      }
   loadGroup() {
    console.log('Estamos a dentro del metodo');

       this.groupService.getGroups().subscribe({
        next: (group) => {
          console.log(group);
          this.groups = group;
        },
        error: (err) => {
          console.error("Error al cargar grupos:", err);
          this.interactionService.showToast('Error al cargar grupos.');
        }
      });
    }
    // Getter para el array de campos
    get fields(): FormArray {
      return this.typeRequestForm.get('fields') as FormArray;
    }

    getString(obj: any) {
      console.log(obj.value);
      return JSON.stringify(obj.value);
    }
    // Añadir un nuevo campo dinámico
    addField() {
      const fieldGroup = this.fb.group({
        name: ['', Validators.required],
        type: ['', Validators.required],
        options: this.fb.array([]), // Agregar FormArray para opciones si es necesario
      });

      this.fields.push(fieldGroup);
      this.showOptionsList.push(false);
    }

    // Eliminar un campo dinámico
    removeField(index: number) {
      this.fields.removeAt(index);
    }

    // Manejo del cambio de tipo de campo
    onFieldTypeChange(index: number) {
      const fields = this.typeRequestForm.get('fields') as FormArray;
      const field = fields.at(index) as FormGroup;
      if (
        ['radiobutton', 'lista', 'checkbox'].includes(field.get('type')?.value)
      ) {
        if (!field.get('options')) {
          field.addControl('options', this.fb.array([])); // Agregar FormArray de opciones
        }
      } else {
        if (field.get('options')) {
          field.removeControl('options'); // Eliminar FormArray de opciones
        }
      }
    }
    // Añadir una opción a un campo específico
    addOption(fieldIndex: number) {
      const options = this.fields.at(fieldIndex).get('options') as FormArray;
      options.push(this.fb.group({
        name: ['', Validators.required]
      }))

    }

    // Eliminar una opción de un campo específico
    removeOption(fieldIndex: number, optionIndex: number) {
      const fields = this.typeRequestForm.get('fields') as FormArray;
      const options = fields.at(fieldIndex).get('options') as FormArray;
      options.removeAt(optionIndex); // Elimina la opción seleccionada
    }

    // Obtener el array de opciones para un campo
    getOptions(fieldIndex: number): FormArray {
      return this.fields.at(fieldIndex).get('options') as FormArray;
    }

    // Guardar el tipo de solicitud

    addTypeRequest() {
      if (this.typeRequestForm.invalid) {
        alert('Por favor complete todos los campos obligatorios.');
        return;
      }

      const newTypeRequest: TypeRI = {
        ...this.typeRequestForm.value,
        created_at: new Date().toISOString() // opcional, si tu tabla lo requiere
      };

      // Validar nombres únicos
      const fieldNames = newTypeRequest.fields.map(f => f.name?.trim() || '');
      if (new Set(fieldNames).size !== fieldNames.length) {
        alert('Los nombres de los campos deben ser únicos.');
        return;
      }

      this.typeService.addTypeRequests(newTypeRequest).subscribe({
        next: () => {
          this.typeRequests.push(newTypeRequest);
          this.typeRequestForm.reset();
          this.fields.clear();
          this.showOptionsList = [];
          this.loadTypeRequests();
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar tipo de solicitud.');
        }
      });
    }
       // Cargar tipos de solicitudes desde LocalStorage
    loadTypeRequests() {
      this.typeService.getTypeRequests().subscribe(type => {
        this.typeRequests = type;
      });
    }
}
