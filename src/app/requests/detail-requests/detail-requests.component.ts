import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestsI } from 'src/app/models/requests.models';
import { StateI } from 'src/app/models/state.models';
import { StatesService } from 'src/app/services/crud/states.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { RequestsService } from 'src/app/services/requests/requests.service';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonCardHeader,
  IonCardTitle,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCardSubtitle,
  IonImg,
  IonBackButton, IonList, IonPopover, IonAvatar, IonIcon, IonText } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImageViewModalComponent } from './image-view-modal/image-view-modal.component';
import { ModalController } from '@ionic/angular';
import { filter, firstValueFrom, throwError } from 'rxjs';
import { getIdFromMaybeObject } from 'src/app/helper/utils';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { PopoverController } from '@ionic/angular/standalone';
import { UserMenuComponent } from 'src/app/components/user-menu/user-menu.component';

@Component({
  selector: 'app-detail-requests',
  templateUrl: './detail-requests.component.html',
  styleUrls: ['./detail-requests.component.scss'],
  providers: [ModalController],
  standalone: true,
  imports: [IonText, IonIcon, IonAvatar, IonPopover, IonList,
    IonBackButton,
    IonCardSubtitle,
    IonLabel,
    IonItem,
    IonCardContent,
    IonCard,
    IonCardTitle,
    IonCardHeader,
    IonContent,
    IonTitle,
    IonButton,
    IonButtons,
    IonToolbar,
    IonHeader,
    IonSelect,
    IonSelectOption,
    FormsModule,
    CommonModule,
  ],
})
export class DetailRequestsComponent implements OnInit {
  request!: RequestsI;
  states: StateI[] = [];
  selectedStateId: string | null = null;
  isLoading = true;
  userData = { userName: '', userPhone: '' };
  userPhoto: string = '';
  showUserMenu = false;
  selectedDoc: File | null = null;
  requestId!: string;
  documentUrl: string | null = null;

  originalStateId: string | null = null;
  isStateChanged = false;

  modalController = inject(ModalController);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestsService: RequestsService,
    private supabaseNameService: SupabaseService,
    private statesService: StatesService,
    // private notificationPushService: NotificationappService,
    private interactionService: InteractionService,
    private popoverCtrl: PopoverController
  ) {}

  docPreviewUrl: string | null = null;

  onDocumentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedDoc = input.files[0];

    // Generar URL para vista previa/link de descarga
    this.docPreviewUrl = URL.createObjectURL(this.selectedDoc);
  }

  async loadDocument(){
    // Aquí ya puedes pasar `file` a tu servicio para subirlo
    try {
      await this.interactionService.showLoading('Subiendo documento...');
      await this.requestsService.attachDocument(this.requestId, this.selectedDoc);
      this.interactionService.dismissLoading();
      this.interactionService.showToast('Documento adjuntado ✅');

    } catch (err: any) {
      this.interactionService.dismissLoading();
      this.interactionService.showToast('Error: ' + err.message);
      console.error(err);
    }
  }

  objectKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj);
  }
  async ngOnInit() {

    this.requestId = this.route.snapshot.paramMap.get('id')!;
    try {
      const user = await this.supabaseNameService.getUserDataName();
      this.userData.userName = user.name;
      this.userData.userPhone = user.phone;
    } catch (error) {
      this.interactionService.showToast('Nombre de usuario no encontrado');
    }
    const requestId = this.route.snapshot.paramMap.get('id');
    if (!requestId) {

      this.router.navigate(['/view-excuse']);
      return;
    }
    this.loadRequestData(requestId);
    this.userPhoto =  await this.supabaseNameService.loadPhoto();
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
    this.supabaseNameService.signOut();
    this.router.navigate(['/auth']);
  }

  onStateChange(newValue: string) {
    this.isStateChanged = newValue !== this.originalStateId;
  }
  async loadRequestData(requestId: string) {
    try {
      // 1. Cargar estados primero
      await firstValueFrom(this.statesService.getStates()).then((states) => {
        this.states = states;
      });

      // 2. Cargar solicitud
      const request = await this.requestsService.getRequestById(requestId);
      if (!request) {
        this.router.navigate(['/view-excuse']);
        return;
      }

      this.request = request;
      //this.selectedStateId = typeof request.state_id === 'object' ? request.state_id?.id : request.state_id
      this.selectedStateId = getIdFromMaybeObject(request.state_id);
      this.originalStateId = this.selectedStateId; // Guardamos el original

    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      this.interactionService.showToast('Error al cargar los datos');
    } finally {
      this.isLoading = false;
    }
  }

  async updateStateDoc() {
    if (!this.selectedStateId) {
      this.interactionService.showToast('Selecciona un estado válido');
      return;
    }
    try {
      await this.requestsService.updateRequestState(
        this.request.id!,
        this.selectedStateId
      );
      this.request.state_id = this.selectedStateId;
      // this.notificationPushService.updateRequestStatus(
      //   this.request.id,
      //   this.request.state_id,
      //   this.selectedStateId
      // );
      this.goToWhatsApp(this.userData.userName, this.userData.userPhone);
      this.loadDocument();
      this.interactionService.showToast('✅ Estado actualizado correctamente');
      this.router.navigate(['/view-excuse']);
    } catch (error) {
      console.error(error);
      this.interactionService.showToast('❌ Error al actualizar estado');
    }
  }

  isImage(value: string): boolean {
    return (
      typeof value === 'string' &&
      (value.startsWith('data:image') || value.startsWith('http'))
    );
  }

  isStringOrNumber(value: any): boolean {
    return typeof value === 'string' || typeof value === 'number';
  }

  goBack() {
    this.router.navigate(['/view-excuse']);
  }
  changePassword(){
    this.router.navigate(['/changed-pass']);
  }

  async openImageModal(imageUrl: string) {
    const modal = await this.modalController.create({
      component: ImageViewModalComponent, // Asegúrate de tener este componente creado
      componentProps: {
        image: imageUrl,
      },
      cssClass: 'image-modal',
    });

    return await modal.present();
  }

  //Envio de Mensaje via Whatsapp
  goToWhatsApp(name: string, rawPhone: string) {

    // 1) Sanitiza el teléfono: elimina todo excepto dígitos
    const digits = rawPhone.replace(/\D+/g, '');
    if (!digits) {
      this.interactionService.showToast('Número de teléfono inválido.');
      return;
    }

    // 2) Asegúrate de que empieza por el código de país
    const countryCode = '1'; // Cambia aquí si usas otro por defecto
    const phone = digits.startsWith(countryCode)
      ? digits
      : countryCode + digits;

    // 3) Construye el mensaje
    const msg = `Saludos, ${name}, su solicitud ha sido procesada.\n` +
                `Gracias.`;

    try {
      const whatsappUrl =
        `https://api.whatsapp.com/send?phone=${phone}` +
        `&text=${encodeURIComponent(msg)}`;

      // 6) Abre la ventana (o pestaña) de WhatsApp
      const win = window.open(whatsappUrl, '_blank');
      if (!win) {
        throw new Error('No se pudo abrir WhatsApp. Permite ventanas emergentes.');
      }
    } catch (error) {
      this.interactionService.showToast('Error al enviar mensaje: ' + error);
    }
  }
}
