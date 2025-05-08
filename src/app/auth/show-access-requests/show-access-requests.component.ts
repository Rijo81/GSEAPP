import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/services/interaction.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import {  IonHeader, IonToolbar, IonTitle, IonButtons, IonAvatar, IonPopover, IonList,
  IonItem, IonContent, IonMenuButton, IonLabel, IonIcon, ModalController } from '@ionic/angular/standalone';
import { Models } from 'src/app/models/models';
import { AccessReqtService } from 'src/app/services/supabase/access-requests/access-reqt.service';
import { CommonModule } from '@angular/common';
import { PasswordConfirmComponent } from './password-confirm/password-confirm.component';

@Component({
  selector: 'app-show-access-requests',
  templateUrl: './show-access-requests.component.html',
  styleUrls: ['./show-access-requests.component.scss'],
  standalone: true,
  imports: [ IonIcon, IonLabel, IonContent, IonItem, IonList, IonPopover, IonAvatar, IonButtons, IonTitle, IonToolbar,
    IonHeader, IonMenuButton, CommonModule ]
})
export class ShowAccessRequestsComponent  implements OnInit {

  access : Models.AccessReq.AccessRequestsI[] = [];
  userPhoto: string = '';
  showUserMenu = false;
  status = {accepted: 'Aprobado', rejected: 'Rechazado'};
  constructor(private supabaseService: SupabaseService,
                private interactionService: InteractionService,
                private accessService: AccessReqtService,
                private router: Router,
                private modalCtrl: ModalController,) { }

  async ngOnInit() {
    //this.loadAccessRequest();
    this.userPhoto =  await this.supabaseService.loadPhoto();
  }

  ionViewWillEnter() {
    this.loadAccessRequest();
  }
    logout() {
      this.supabaseService.signOut();
      this.router.navigate(['/auth']);
    }
    async checkAccessBeforeEdit(accessItem: Models.AccessReq.AccessRequestsI) {
      if (accessItem.status === this.status.accepted || accessItem.status === this.status.rejected) {
        const modal = await this.modalCtrl.create({
          component: PasswordConfirmComponent,
        });
        await modal.present();

        const { data: enteredPassword } = await modal.onDidDismiss();

        if (!enteredPassword) return;

        const isValid = await this.supabaseService.validateUserPassword(enteredPassword);
        if (!isValid) {
          this.interactionService.showToast('❌ Contraseña incorrecta');
          return;
        }

        this.router.navigate(['/details-access', accessItem.id]);
      } else {
        this.router.navigate(['/details-access', accessItem.id]);
      }
    }

    goToDetails(id: string) {
      this.router.navigate(['/details-access', id]);
    }
    changePassword(){
      this.router.navigate(['/changed-pass']);
    }

    loadAccessRequest() {
      this.accessService.getAccessRequest().subscribe(access => {
        this.access = access;
      });
    }

}
