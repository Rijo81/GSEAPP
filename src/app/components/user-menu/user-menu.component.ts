import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from 'src/app/core/supabase.client';
import { IonList, IonItem, PopoverController } from "@ionic/angular/standalone";

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  standalone: true,
  imports: [IonItem, IonList, ]
})
export class UserMenuComponent {

  constructor(
    private popoverCtrl: PopoverController,
    private router: Router
  ) {}

  async logout() {
    await supabase.auth.signOut();
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/auth']);
  }

}
