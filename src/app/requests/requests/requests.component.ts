import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonToolbar, IonHeader, IonTitle, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonItem, IonLabel, IonList, IonInput, IonRadioGroup, IonRadio, IonIcon, IonButton,
  IonCheckbox, IonSelect, IonSelectOption, IonMenuButton, IonAvatar, IonPopover, IonText, IonRow, IonCol, IonGrid } from "@ionic/angular/standalone";
import { RequestsI, TypeRI } from 'src/app/models/requests.models';
import { RequestsService } from 'src/app/services/requests/requests.service';
import { TRequestsService } from 'src/app/services/type-requests/t-requests.service';
import { supabase } from 'src/app/core/supabase.client';
import { environment } from 'src/environments/environment';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { delay, filter, retry, take, tap } from 'rxjs';
import { InteractionService } from 'src/app/services/interaction.service';
import { StatesService } from 'src/app/services/crud/states.service';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular/standalone';
import { UserMenuComponent } from 'src/app/components/user-menu/user-menu.component';
import { StateI } from 'src/app/models/state.models';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
  standalone: true,
  imports: [IonGrid, IonCol, IonRow, IonText, IonPopover, IonAvatar, IonCheckbox, IonButton, IonIcon, IonRadio, IonRadioGroup, IonInput, IonList, IonLabel, IonItem,
    IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent, IonButtons, IonTitle, IonHeader,
    IonToolbar, IonMenuButton, IonSelect, IonSelectOption, ReactiveFormsModule, FormsModule, CommonModule ]
})
export class RequestsComponent  implements OnInit {

  typeRequests: TypeRI[] = [];
  selectedTypeId: string | null = null;
  selectedType: TypeRI | null = null;
  formData: { [key: string]: any } = {};
  requests: any[] = [];
  fields: any[] = [];
  userPhoto: string = '';
  showUserMenu = false;
  states: StateI[] = [];
  isLoading = true;

  private stateImageMap: Record<string,string> = {
    'listo':    'done',
    'en proceso':'inprocess',
    'pendiente':  'waiting'
  };

  constructor(private typeService: TRequestsService,
              private requestService: RequestsService,
              private stateService: StatesService,
              private authSupabaseService: SupabaseService,
              private interactionService: InteractionService,
              private router: Router,
              private popoverCtrl: PopoverController) {

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
    .subscribe( async () => {
      const user = await this.authSupabaseService.getCurrentUser();
      if (!user) {
        this.interactionService.showToast('Usuario no autenticado');
        return;
      }
      //this.loadTypeRequests();
      //await this.loadRequests();
      this.loadStates();
      this.loadRequestsState(user.data.user.id);
      this.isLoading = false;
    });
    console.log('No esta pasando nada.... que eeee');
    console.log('Loaded Solicitudes:', this.requests);
    console.log('Loaded Tipo Solicitudes:', this.typeRequests);
    this.userPhoto =  await this.authSupabaseService.loadPhoto();
  }

 async ionViewWillEnter() {
  await this.loadRequests();
  this.loadTypeRequests();
  }
      logout() {
        this.authSupabaseService.signOut();
        this.router.navigate(['/auth']);
      }
      changePassword(){
        this.router.navigate(['/changed-pass']);
      }
  addField(type: string) {
    this.fields.push({
      name: '',
      type,
      options: [] as string[],  // <-- aquí
    });
  }

  // Cuando agregas una opción a ese campo
  addOption(fieldIndex: number) {
    this.fields[fieldIndex].options.push('');
  }

  isFormValid(): boolean {
    if (!this.selectedType || !this.selectedType.fields) return false;

    for (let field of this.selectedType.fields) {
      const value = this.formData[field.name];

      // Para archivos (type='document'), verificamos si se subió un archivo
      if (field.type === 'document') {
        if (!value) return false;
      }
      // Para checkbox, se permite true o false (opcionalmente puedes hacerlos requeridos)
      else if (field.type === 'checkbox') {
        continue;
      }
      // Para los demás, revisamos que no estén vacíos ni undefined
      else {
        if (value === null || value === undefined || value === '') {
          return false;
        }
      }
    }

    return true;
  }
  loadTypeRequests() {
    this.typeService.getTypeRequests().subscribe({
      next: rawTypes => {
        console.log('📥 rawTypes:', rawTypes);
        this.typeRequests = rawTypes.map(typeReq => ({
          ...typeReq,
          fields: typeReq.fields.map(f => ({
            ...f,
            options: Array.isArray(f.options)
              ? f.options.map(opt =>
                  typeof opt === 'string'
                    ? opt
                    : // si viene como objeto, extrae sólo el name
                      (opt as any).name
                )
              : []
          }))
        }));
        console.log('✅ mapped typeRequests:', this.typeRequests);
      },
      error: err => console.error('❌ Error cargando tipos:', err)
    });
  }


  async loadRequests() {
    const userId = await this.authSupabaseService.getUserAppData();

  if (!userId) {
    console.warn('⚠️ No se pudo obtener el ID del usuario.');
    return;
  }

  this.requestService.getRequestsByUser(userId.id).subscribe(req => {
    this.requests = req;
    console.log('📦 Solicitudes del usuario:', this.requests);
  });
  }
  onTypeChange() {
    this.selectedType = this.typeRequests.find(type => type.id === this.selectedTypeId) || null;
    this.formData = {};
  }

  clearLocalStorage(){
    localStorage.removeItem('requests');
  }

  onFileChange(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.formData[fieldName] = reader.result; // Guardamos la base64 del archivo.
      };
      reader.readAsDataURL(file);
    }
  }

  async saveRequest() {

    if (!this.selectedType) {
      alert('Debe seleccionar un tipo de solicitud.');
      return;
    }

    try {
      // 1. Obtener datos del usuario actual
      const user = await this.authSupabaseService.getUserAppData();
      if (!user) {
        alert('No se pudo obtener el usuario actual.');
        return;
      }

      // 2. Subir imágenes a Supabase Storage si existen
      for (const key of Object.keys(this.formData)) {
        const value = this.formData[key];

        if (typeof value === 'string' && value.startsWith('data:image')) {
          const base64Data = value.split(',')[1];
          const contentType = value.split(';')[0].split(':')[1];
          const fileName = `${crypto.randomUUID()}.png`;

          const fileBlob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], {
            type: contentType
          });

          const filePath = `requests/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('requests-file')
            .upload(filePath, fileBlob);

          if (uploadError) {
            console.error('Error al subir imagen:', uploadError.message);
            alert('Error al subir imagen.');
            return;
          }

          const publicUrl = `${environment.supabaseUrl}/storage/v1/object/public/requests-file/${filePath}`;
          this.formData[key] = publicUrl;
        }
      }

      const initialStateId = await this.stateService.getInitialState();
      console.log('Initial state', initialStateId);

      if (!initialStateId) {
        alert('No se pudo asignar un estado por defecto.');
        return;
      }
      // 3. Guardar la solicitud
      const newRequest: RequestsI = {
        id: crypto.randomUUID(),
        typeName: this.selectedType.name,
        group_origin: this.selectedType.group_origin,
        group_destine: this.selectedType.group_destine,
        formData: { ...this.formData },
        user_id: user.id,
        state_id: initialStateId
      };

      this.requestService.addRequests(newRequest).subscribe({
        next: () => {
          this.loadRequests();
          this.formData = {};
          this.selectedTypeId = null;
          this.selectedType = null;
          this.interactionService.presentAlert('Envio de Solicitud', 'Solicitud enviada con éxito');
        },
        error: (err) => {
          console.error('Error al guardar solicitud:', err);
          alert('Error al guardar solicitud.');
        }
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      this.interactionService.showToast('Ocurrió un error inesperado al guardar la solicitud.');
    }
  }
  saveToLocalStorage() {
    this.requestService.getRequests().subscribe(type => {
      this.requests = type;
    });
  }

  //ESTADO DE LA SOLICITUD

      /** Extrae el nombre del fichero desde la URL */
      getFileName(url: string): string {
        const parts = url.split('/');
        const raw   = parts.pop() || ' ';
        return decodeURIComponent(raw);
      }
      /** Abre la URL en una pestaña nueva para descargar/ver */
      openDocument(url: string) {
        window.open(url, '_blank');
      }

  loadStates() {
    this.stateService.getStates().subscribe({
     next: (data) => this.states = data,
     error: () => console.error('❌ Error al cargar estados')
   });
 }
 loadRequestsState(userId: string) {
   this.requestService.getRequestsByUserForState(userId).then(data => {
     this.requests = data;
     console.log('Solicitudes cargadas', this.requests);

   }).catch(error => {
     console.error('❌ Error al cargar solicitudes', error);
   });
 }
 getStateNameById(stateId: string): string {
   const state = this.states.find(s => s.id === stateId);
   console.log('Nombre del state', state);
   return state?.name || 'Pendiente';
 }
//  getStateImage(stateName: string): string {

//    switch (stateName.toLowerCase()) {
//      case 'activo':
//        return 'assets/state/done.png';
//      case 'en proceso':
//        return 'assets/state/inprocess.png';
//      case 'inactivo':
//        return 'assets/state/waiting.png';
//      default:
//        return 'assets/states/default.png';
//    }
//  }
 getStateImage(stateName: string): string {
  const key = stateName.trim().toLowerCase();
  // Busca en el mapa; si no está, usa 'default'
  const file = this.stateImageMap[key] || 'default';
  return `assets/state/${file}.png`;
}
}
