import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonTitle, IonToolbar, IonButtons, IonContent, IonMenuButton, PopoverController, IonAvatar, IonPopover, IonList, IonItem, IonImg, IonIcon } from '@ionic/angular/standalone';
import { ConfigScreenExcuseService } from 'src/app/services/supabase/config/config-screen-excuse.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';

@Component({
  selector: 'app-excuse',
  templateUrl: './excuse.component.html',
  styleUrls: ['./excuse.component.scss'],
  standalone: true,
  imports: [IonIcon, IonImg, IonItem, IonList, IonPopover, IonAvatar,  IonContent, IonButtons, IonToolbar, IonTitle,
    IonHeader, IonMenuButton, CommonModule ]
})
export class ExcuseComponent  implements OnInit {

  datos = {
    image: 'assets/logo.png',
    title: '',
    text: ''
  };
  userPhoto: string = '';
  showUserMenu = false;

  constructor(private imagenTitleTextService: ConfigScreenExcuseService,
              private supabaseService: SupabaseService,
              private router: Router,
              private popoverCtrl: PopoverController,
   ) {}

  async ngOnInit() {
    this.imagenTitleTextService.image$.subscribe((url) => {
      this.datos.image = url;
    });
    this.imagenTitleTextService.title$.subscribe(title => this.datos.title = title);
    this.imagenTitleTextService.text$.subscribe(text => this.datos.text = text);

    this.userPhoto =  await this.supabaseService.loadPhoto();
  }

    logout() {
      this.supabaseService.signOut();
      this.router.navigate(['/auth']);
    }
    changePassword(){
      this.router.navigate(['/changed-pass']);
    }
}
