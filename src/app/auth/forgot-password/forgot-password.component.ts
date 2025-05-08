import { Component} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from 'src/app/core/supabase.client';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonText, IonIcon, IonButtons, IonBackButton } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, IonText, IonButton, IonInput, IonLabel, IonItem, IonContent, IonTitle, IonToolbar, IonHeader,
    ReactiveFormsModule, CommonModule
  ]
})
export class ForgotPasswordComponent {

  form: FormGroup;
  message: string = '';
  error: string = '';

  constructor(private fb: FormBuilder,
              private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async resetPassword() {
    const { email } = this.form.value;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8100/reset-password'
    });

    if (error) {
      this.error = error.message;
      this.message = '';
    } else {
      this.message = '📩 Te hemos enviado un correo para restablecer tu contraseña.';
      this.error = '';
    }

    setTimeout(() => {
      this.form.reset();
      this.message = '';
      this.error = '';
    }, 2000);
  }

  goLogin(){
    this.router.navigate(['/auth']);
  }
}
