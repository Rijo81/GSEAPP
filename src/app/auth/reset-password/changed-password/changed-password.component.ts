import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from 'src/app/core/supabase.client';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonInput, IonButton, IonItem, IonText,
  IonButtons, IonBackButton, IonAvatar, IonPopover, IonList, IonIcon } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';

@Component({
  selector: 'app-changed-password',
  templateUrl: './changed-password.component.html',
  styleUrls: ['./changed-password.component.scss'],
  standalone: true,
  imports:[ IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonInput, IonButton, IonItem, IonText,
    FormsModule, ReactiveFormsModule, IonButtons, IonBackButton, CommonModule,
   ]
})
export class ChangedPasswordComponent  implements OnInit {

    form: FormGroup;
    message: string = '';
    error: string = '';
    accessToken: string | null = null;
    userPhoto: string = '';

    constructor(private fb: FormBuilder, private router: Router,
      private supabaseService: SupabaseService
    ) {
      this.form = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm: ['', [Validators.required]],
      }, { validators: this.passwordsMatch });
    }

    async ngOnInit(){
      console.log('Constructor');
      this.userPhoto =  await this.supabaseService.loadPhoto();
    }

    private passwordsMatch(group: FormGroup) {
      const pass = group.get('password')!.value;
      const confirm = group.get('confirm')!.value;
      return pass === confirm ? null : { mismatch: true };
    }

    async updatePassword() {
      // if (!this.accessToken) return;

      const { password, confirm } = this.form.value;

      if (password !== confirm) {
        this.error = 'Las contraseñas no coinciden';
        return;
      }

      try {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          this.error = error.message;
          this.message = '';
        } else {
          this.message = '✅ Contraseña actualizada correctamente. Serás redirigido al login.';
          this.error = '';
          setTimeout(() => {
            this.router.navigate(['/auth']);
          }, 1000);
        }
      } catch (err) {
        console.error('Error inesperado:', err);
        this.error = '⚠️ Algo salió mal. Intenta nuevamente.';
      }
    }
}
