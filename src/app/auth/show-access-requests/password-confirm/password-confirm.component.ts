import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonItem, IonLabel, IonContent, IonInput,
  ModalController
 } from "@ionic/angular/standalone";

@Component({
  selector: 'app-password-confirm',
  templateUrl: './password-confirm.component.html',
  styleUrls: ['./password-confirm.component.scss'],
  standalone: true,
  imports: [IonInput, IonContent, IonLabel, IonItem, IonButton, IonButtons, IonTitle, IonToolbar, IonHeader, FormsModule ]
})
export class PasswordConfirmComponent implements AfterViewInit {
  @ViewChild('passwordInput', { static: false }) passwordInput!: IonInput;
  password: string = '';

  constructor(private modalCtrl: ModalController) {}

  ngAfterViewInit() {
    // Forzar foco en el input una vez cargado el view
    setTimeout(() => {
      this.passwordInput.setFocus();
    }, 300);
  }

  confirm() {
    this.modalCtrl.dismiss(this.password);
  }

  dismiss() {
    this.modalCtrl.dismiss(null);
  }

}
