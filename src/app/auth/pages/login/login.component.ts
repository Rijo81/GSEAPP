import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonInput, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonButton,
  IonToggle, IonIcon, IonImg, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";
import { InteractionService } from 'src/app/services/interaction.service';
import { ConfigLogoService } from 'src/app/services/supabase/config/config-logo.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonImg, IonIcon, IonButton, IonLabel, IonItem, IonContent, IonTitle, IonToolbar, IonInput, IonHeader, FormsModule,
    IonToggle, FormsModule, ReactiveFormsModule, CommonModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error: string | null = null;
  logo: string = 'assets/icon/favicon.png'
  title: string = '';

  constructor(private supabaseService: SupabaseService,
              private router: Router,
              private interactionService: InteractionService,
              private imageLogoService: ConfigLogoService,
              private fb: FormBuilder) {
                this.loginForm = this.fb.group({
                  email: ['', [Validators.required, Validators.email]],
                  password: ['', Validators.required],
                  rememberMe: [false, Validators.required]
                });
              }

  ngOnInit() { console.log('un momento');
    this.imageLogoService.image$.subscribe((url) => {
      this.logo = url;
    });
    this.imageLogoService.title$.subscribe(title => this.title = title);
  }

  ionViewWillEnter() {
    // Guardamos antes del reset
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPass = localStorage.getItem('rememberedPassword');
    const remember = localStorage.getItem('rememberMe') === 'true';

    this.loginForm.reset(); // ← resetea, pero ya tenemos los valores guardados

    if (remember && savedEmail && savedPass) {
      this.loginForm.setValue({
        email: savedEmail,
        password: savedPass,
        rememberMe: true
      });
    } else {
      this.loginForm.setValue({
        email: '',
        password: '',
        rememberMe: false
      });
    }

    this.error = '';
  }
  async login() {
    try {
      if (this.loginForm.invalid) return;

      const { email, password, rememberMe } = this.loginForm.value;
      await this.interactionService.showLoading('Iniciando Session...');
      const { groups } = await this.supabaseService.signIn(email, password);
      console.log("GRUPO: ", groups);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.setItem('rememberMe', 'false');
      }
      this.interactionService.dismissLoading();
      this.interactionService.showToast('Sesión iniciada');

      if (groups === 'padre') {
        this.router.navigate(['/screen-excuse']);
      } else{
        this.router.navigate(['/home']);
      }

    } catch (error) {
      this.error = "Hay un problema con su credenciales: " + error;
      this.interactionService.showToast('Error al iniciar sesión');
      console.error(error);
    }finally{
      this.interactionService.dismissLoading();
    }
  }
  goAccessRequest(){
    this.router.navigate(['/access']);
  }

  goForGot(){
    this.router.navigate(['/forgot']);
  }
}
