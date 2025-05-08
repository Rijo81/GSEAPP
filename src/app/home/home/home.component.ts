import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonMenuButton, PopoverController, IonAvatar, IonPopover, IonList, IonItem, IonImg, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { ConfigScreenRequestsService } from 'src/app/services/supabase/config/config-screen-requests.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [IonIcon,  IonImg, IonItem, IonList, IonPopover, IonAvatar, IonContent, IonButtons, IonTitle, IonToolbar,
    IonHeader, IonMenuButton, CommonModule ]
})
export class HomeComponent  implements OnInit {

  datos = {
    image: 'assets/logo.png',
    title: '',
    text: ''
  };
  userPhoto: string = '';
  showUserMenu = false;

  constructor(private imagenTitleTextService: ConfigScreenRequestsService,
              private supabaseService: SupabaseService,
              private router: Router,
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
