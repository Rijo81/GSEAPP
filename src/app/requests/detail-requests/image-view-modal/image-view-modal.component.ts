import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonContent, IonImg, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-image-view-modal',
  templateUrl: './image-view-modal.component.html',
  styleUrls: ['./image-view-modal.component.scss'],
  standalone: true,
  imports: [IonButton, IonImg, IonContent,  ]
})
export class ImageViewModalComponent  {

  @Input() image!: string;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
