import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Models } from 'src/app/models/models';
import { InteractionService } from 'src/app/services/interaction.service';
import { AccessReqtService } from 'src/app/services/supabase/access-requests/access-reqt.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { PopoverController, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonAvatar,
  IonPopover, IonList, IonItem, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonLabel, IonIcon, IonButton } from '@ionic/angular/standalone';
import { UserMenuComponent } from 'src/app/components/user-menu/user-menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-access',
  templateUrl: './details-access.component.html',
  styleUrls: ['./details-access.component.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonCardContent, IonCardTitle, IonCardHeader, IonCard,
    IonContent, IonItem, IonList, IonPopover, IonAvatar, IonTitle, IonBackButton, IonButtons,
    IonToolbar, IonHeader, CommonModule, IonIcon ]
})
export class DetailsAccessComponent  implements OnInit {

    access!: Models.AccessReq.AccessRequestsI;
    isLoading = true;
    status = {accepted: 'Aprobado', rejected: 'Rechazado'};
    userPhoto: string = '';
    showUserMenu = false;
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private accessService: AccessReqtService,
      private supabaseService: SupabaseService,
      private interactionService: InteractionService,
    ) {}
    async ngOnInit() {

      const accessId = this.route.snapshot.paramMap.get('id');
      if (!accessId) {
        this.router.navigate(['/show-access']);
        return;
      }
      this.loadAccessData(accessId);
      this.userPhoto =  await this.supabaseService.loadPhoto();
    }
    isGroup(groupName: string): boolean {
      return !!this.access.group &&
             this.access.group.toLowerCase().trim() === groupName.toLowerCase().trim();
    }
    async loadAccessData(accessId: string) {
      try {
        // 2. Cargar solicitud
        const accessReq = await this.accessService.getAccessById(accessId);
        if (!accessReq) {
          this.router.navigate(['/show-access']);
          return;
        }
        this.access = accessReq;
        //this.selectedStateId = typeof request.state_id === 'object' ? request.state_id?.id : request.state_id
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
        this.interactionService.showToast('Error al cargar los datos');
      } finally {
        this.isLoading = false;
      }
    }
    isStringOrNumber(value: any): boolean {
      return typeof value === 'string' || typeof value === 'number';
    }
    goBack() {
      this.router.navigate(['/show-access']);
    }

async acceptedRequestAccess(name: string, rawPhone: string) {
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
  const msg = `Saludos, ${name}, su solicitud de acceso ha sido aprobada.\n` +
              `Por favor regístrese aquí:\n` +
              `https://www.example.com/register`;

  // 4) Pregunta de confirmación
  const confirmed = await this.interactionService.presentAlert(
    'Aprobando acceso al sistema',
    '¿Estás seguro de realizar esta acción?',
    'Cancelar'
  );
  if (!confirmed) return;

  try {
    await this.interactionService.showLoading('Aprobando acceso...');
    // 5) Prepara la URL de WhatsApp Web API
    const whatsappUrl =
      `https://api.whatsapp.com/send?phone=${phone}` +
      `&text=${encodeURIComponent(msg)}`;

    // 6) Abre la ventana (o pestaña) de WhatsApp
    const win = window.open(whatsappUrl, '_blank');
    if (!win) {
      throw new Error('No se pudo abrir WhatsApp. Permite ventanas emergentes.');
    }

    // 7) Actualiza el estado en tu backend
    await this.accessService.updateStatusAccessRequest(
      this.access.id!,
      this.status.accepted
    );
    this.access.status = this.status.accepted;

    this.interactionService.showToast('✅ Solicitud aprobada y actualizada correctamente.');
    this.goBack();

  } catch (error: any) {
    console.error('❌ Error al aprobar solicitud:', error);
    this.interactionService.showToast(
      `Error al enviar mensaje: ${error.message || error}`
    );
  } finally {
    this.interactionService.dismissLoading();
  }
}

    async rejectedRequestAccess(name: string, rawPhone: string) { // 1) Sanitiza el teléfono: elimina todo excepto dígitos
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
      const msg = `Saludos, ${name}, lamentamos informarte que tu solicitud de acceso fue rechazada.\n` +
                  `Si tiene alguna duda contactenos al Telefono: 809-902-8301. Gracias.\n` +
                  `https://www.example.com/register`;

      // 4) Pregunta de confirmación
      const confirmed = await this.interactionService.presentAlert(
        'Rechazando acceso al sistema',
        '¿Estás seguro de realizar esta acción?',
        'Cancelar'
      );
      if (!confirmed) return;

      try {
        await this.interactionService.showLoading('Rechazando acceso...');
        // 5) Prepara la URL de WhatsApp Web API
        const whatsappUrl =
          `https://api.whatsapp.com/send?phone=${phone}` +
          `&text=${encodeURIComponent(msg)}`;

        // 6) Abre la ventana (o pestaña) de WhatsApp
        const win = window.open(whatsappUrl, '_blank');
        if (!win) {
          throw new Error('No se pudo abrir WhatsApp. Permite ventanas emergentes.');
        }

        // 7) Actualiza el estado en tu backend
        await this.accessService.updateStatusAccessRequest(
          this.access.id!,
          this.status.rejected
        );
        this.access.status = this.status.rejected;

        this.interactionService.showToast('Solicitud rechazada.');
        this.goBack();

      } catch (error: any) {
        console.error('❌ Error al recharzar solicitud:', error);
        this.interactionService.showToast(
          `Error al enviar mensaje: ${error.message || error}`
        );
      } finally {
        this.interactionService.dismissLoading();
      }


    //   const msg = `Hola ${name}, lamentamos informarte que tu solicitud de acceso fue rechazada.
    //   Cualquier pregunta contactenos al Telefono: 809-902-8301. Gracias`;

    //   const confirmed = await this.interactionService.presentAlert(
    //     'Rechazando acceso al sistema',
    //     'Esta seguro de realizar esta accion',
    //     'Cancelar');

    //   if (confirmed){
    //   try {
    //     await this.interactionService.showLoading('Aprobando acceso...');
    //     const url = `https://wa.me/1${'1' + phone}?text=${encodeURIComponent(msg)}`;
    //     window.open(url, '_blank');
    //     await this.accessService.updateStatusAccessRequest(this.access.id!, this.status.rejected);
    //     this.access.status = this.status.rejected;
    //     this.interactionService.dismissLoading();
    //     this.interactionService.showToast('🚫 Solicitud rechazada y actualizada correctamente.');
    //     this.goBack();
    //   } catch (error) {
    //     console.error('❌ Error al rechazar solicitud:', error);
    //     this.interactionService.showToast('Error al enviar mensaje: ' + error);
    //   }
    // }
  }

  goRegisterUser(){
    this.router.navigate(['/user-supabase']);
  }
  logout() {
    this.supabaseService.signOut();
    this.router.navigate(['/auth']);
  }
  changePassword(){
    this.router.navigate(['/reset-pass']);
  }
}
