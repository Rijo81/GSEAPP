import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonButton, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonToggle, PopoverController, IonAvatar, IonPopover, IonList, IonIcon } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource  } from '@capacitor/camera';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfigScreenRequestsService } from 'src/app/services/supabase/config/config-screen-requests.service';
import { ConfigScreenExcuseService } from 'src/app/services/supabase/config/config-screen-excuse.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { Router } from '@angular/router';
import { ConfigLogoService } from 'src/app/services/supabase/config/config-logo.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  standalone: true,
  imports: [IonIcon, IonList, IonPopover, IonAvatar, IonToggle, IonInput, IonLabel, IonItem, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonButton,
    IonContent, IonButtons, IonTitle, IonToolbar, IonHeader, IonMenuButton, FormsModule, CommonModule ]
})
export class ConfigurationComponent  implements OnInit {


  showForm = {
    formSolict: false,
    formExcuse: false,
    formLogo: false,
    isDarkMode: false
  };

  userPhoto = '';

  // Campos ligados a los formularios
  newTitle = '';
  newText  = '';

  // Estados actuales
  currentSolict = { image: '', title: '', text: '' };
  currentExcuse = { image: '', title: '', text: '' };
  currentLogo   = { image: '', title: '' };

  // Para el flujo de imagen “Solicitud”
  selectedSolicitImgBase64: string|null = null;
  selectedSolicitImgFormat: string|null = null;
  selectedSolicitImgName:   string|null = null;

  // Para el flujo de imagen “Excusa”
  selectedExcuseImgBase64: string|null = null;
  selectedExcuseImgFormat: string|null = null;
  selectedExcuseImgName:   string|null = null;

  // Para el flujo de imagen “Logo”
  selectedLogoImgBase64: string|null = null;
  selectedLogoImgFormat: string|null = null;
  selectedLogoImgName:   string|null = null;

  constructor(
    private reqCfg: ConfigScreenRequestsService,
    private excCfg: ConfigScreenExcuseService,
    private logoService: ConfigLogoService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Tema
    const storedTheme = localStorage.getItem('theme');
    this.showForm.isDarkMode = storedTheme === 'dark';
    this.applyTheme();

    // Avatar
    this.userPhoto = await this.supabaseService.loadPhoto();

    // Suscripciones a valores actuales
    this.reqCfg.image$.subscribe(img => this.currentSolict.image = img);
    this.reqCfg.title$.subscribe(t  => this.currentSolict.title = t);
    this.reqCfg.text$.subscribe(txt=> this.currentSolict.text  = txt);

    this.excCfg.image$.subscribe(img => this.currentExcuse.image = img);
    this.excCfg.title$.subscribe(t  => this.currentExcuse.title = t);
    this.excCfg.text$.subscribe(txt=> this.currentExcuse.text  = txt);

    this.logoService.image$.subscribe(img => this.currentLogo.image = img);
    this.logoService.title$.subscribe(t  => this.currentExcuse.title = t);
  }

  logout() {
    this.supabaseService.signOut();
    this.router.navigate(['/auth']);
  }

  changePassword(){
    this.router.navigate(['/changed-pass']);
  }

  // Tema
  toggleDarkMode(event: any) {
    this.showForm.isDarkMode = event.detail.checked;
    localStorage.setItem('theme', this.showForm.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }
  applyTheme() {
    document.body.classList.toggle('dark', this.showForm.isDarkMode);
  }

  // ——— Solicitudes ———

  get canUpdateSolicit(): boolean {
    return this.newTitle.trim() !== '' && this.newText.trim() !== '';
  }

  updateDataTitleText() {
    if (!this.canUpdateSolicit) return;
    this.reqCfg.changeTitle(this.newTitle);
    this.reqCfg.changeText(this.newText);
    this.newTitle = '';
    this.newText  = '';
  }

  async selectSolicitImage() {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (!photo.base64String) return;

      // almacenamos selección, creamos nombre
      this.selectedSolicitImgBase64 = photo.base64String;
      this.selectedSolicitImgFormat = photo.format;
      this.selectedSolicitImgName   = `solicit_${Date.now()}.${photo.format}`;
    } catch (e) {
      console.error('Error al seleccionar imagen solicit:', e);
    }
  }

  async uploadSolicitImage() {
    if (!this.selectedSolicitImgBase64) return;
    await this.reqCfg.changeImageBase64(
      this.selectedSolicitImgBase64,
      this.selectedSolicitImgFormat!
    );
    // limpiamos estado
    this.selectedSolicitImgBase64 = null;
    this.selectedSolicitImgFormat = null;
    this.selectedSolicitImgName   = null;
  }

  get canUploadSolicitImage(): boolean {
    return !!this.selectedSolicitImgBase64;
  }

  // ——— Excusas ———

  get canUpdateExcuse(): boolean {
    return this.newTitle.trim() !== '' && this.newText.trim() !== '';
  }

  updateDataTitleTextExcuse() {
    if (!this.canUpdateExcuse) return;
    this.excCfg.changeTitle(this.newTitle);
    this.excCfg.changeText(this.newText);
    this.newTitle = '';
    this.newText  = '';
  }

  async selectExcuseImage() {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (!photo.base64String) return;

      this.selectedExcuseImgBase64 = photo.base64String;
      this.selectedExcuseImgFormat = photo.format;
      this.selectedExcuseImgName   = `excuse_${Date.now()}.${photo.format}`;
    } catch (e) {
      console.error('Error al seleccionar imagen excuse:', e);
    }
  }

  async uploadExcuseImage() {
    if (!this.selectedExcuseImgBase64) return;
    await this.excCfg.changeImageBase64(
      this.selectedExcuseImgBase64,
      this.selectedExcuseImgFormat!
    );
    this.selectedExcuseImgBase64 = null;
    this.selectedExcuseImgFormat = null;
    this.selectedExcuseImgName   = null;
  }

  get canUploadExcuseImage(): boolean {
    return !!this.selectedExcuseImgBase64;
  }

  // ——— Logo ———

  get canUpdateTitleLogo(): boolean {
    return this.newTitle.trim() !== '';
  }
  updateLogoTitleText() {
    if (!this.canUpdateTitleLogo) return;
    this.logoService.changeTitle(this.newTitle);
    this.newTitle = '';
  }
  async selectLogoImage() {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (!photo.base64String) return;

      this.selectedLogoImgBase64 = photo.base64String;
      this.selectedLogoImgFormat = photo.format;
      this.selectedLogoImgName   = `logo_${Date.now()}.${photo.format}`;
    } catch (e) {
      console.error('Error al seleccionar imagen logo:', e);
    }
  }

  async uploadLogoImage() {
    if (!this.selectedLogoImgBase64) return;
    await this.logoService.changeImageBase64(
      this.selectedLogoImgBase64,
      this.selectedLogoImgFormat!
    );
    this.selectedLogoImgBase64 = null;
    this.selectedLogoImgFormat = null;
    this.selectedLogoImgName   = null;
  }

  get canUploadLogoImage(): boolean {
    return !!this.selectedLogoImgBase64;
  }

  /**
   * Enciende sólo la sección indicada y apaga las otras.
   * @param section 'formSolict' | 'formExcuse' | 'formLogo'
   */
  toggleSection(section: 'formSolict' | 'formExcuse' | 'formLogo', event: CustomEvent<{ checked: boolean}>) {
    const checked = event.detail.checked;
    // Primero apaga todas
    if (checked) {
      this.showForm.formSolict  = false;
      this.showForm.formExcuse = false;
      this.showForm.formLogo    = false;
      this.showForm[section] = true;
    }else{
      this.showForm[section]    = !this.showForm[section];
    }
  }
  // showForm = {
  //   formSolict: false,
  //   formExcuse: false,
  //   isDarkMode: false,
  //   formLogo: false
  // };

  // userPhoto = '';
  // showUserMenu = false;

  // // Campos ligados a los formularios
  // newTitle = '';
  // newText  = '';
  // newImageFile: File | null = null;

  // // Valores corrientes de cada pantalla
  // currentSolict = { image: '', title: '', text: '' };
  // currentExcuse = { image: '', title: '', text: '' };
  // currentLogo = { image: '' };

  // constructor(
  //   private reqCfg: ConfigScreenRequestsService,
  //   private excCfg: ConfigScreenExcuseService,
  //   private logoService: ConfigLogoService,
  //   private supabaseService: SupabaseService,
  //   private router: Router
  // ) {}

  // async ngOnInit() {
  //   // Tema
  //   const storedTheme = localStorage.getItem('theme');
  //   this.showForm.isDarkMode = storedTheme === 'dark';
  //   this.applyTheme();

  //   // Avatar
  //   this.userPhoto = await this.supabaseService.loadPhoto();

  //   // Suscripciones a valores actuales
  //   this.reqCfg.image$.subscribe(img => this.currentSolict.image = img);
  //   this.reqCfg.title$.subscribe(t  => this.currentSolict.title = t);
  //   this.reqCfg.text$.subscribe(txt=> this.currentSolict.text  = txt);

  //   this.excCfg.image$.subscribe(img => this.currentExcuse.image = img);
  //   this.excCfg.title$.subscribe(t  => this.currentExcuse.title = t);
  //   this.excCfg.text$.subscribe(txt=> this.currentExcuse.text  = txt);

  //   //LOGO
  //   this.logoService.image$.subscribe(img => this.currentLogo.image = img);
  // }
  // logout() {
  //   this.supabaseService.signOut();
  //   this.router.navigate(['/auth']);
  // }

  // changePassword(){
  //   this.router.navigate(['/changed-pass']);
  // }
  // // Tema
  // toggleDarkMode(event: any) {
  //   this.showForm.isDarkMode = event.detail.checked;
  //   localStorage.setItem('theme', this.showForm.isDarkMode ? 'dark' : 'light');
  //   this.applyTheme();
  // }
  // applyTheme() {
  //   document.body.classList.toggle('dark', this.showForm.isDarkMode);
  // }

  // // ——— Solicitudes ———

  // updateDataTitleText() {
  //   if (this.newTitle.trim()) {
  //     this.reqCfg.changeTitle(this.newTitle);
  //     this.newTitle = '';
  //   }
  //   if (this.newText.trim()) {
  //     this.reqCfg.changeText(this.newText);
  //     this.newText = '';
  //   }
  // }

  // async selectImageFromGallery() {
  //   try {
  //     const photo = await Camera.getPhoto({
  //       quality: 80,
  //       allowEditing: false,
  //       resultType: CameraResultType.Base64,
  //       source: CameraSource.Photos
  //     });

  //     if (photo && photo.base64String) {
  //       await this.reqCfg.changeImageBase64(photo.base64String, photo.format);
  //     }
  //   } catch (e) {
  //     console.error('Error al seleccionar imagen:', e);
  //   }
  // }

  // // ——— Excusas ———

  // updateDataTitleTextExcuse() {
  //   if (this.newTitle.trim()) {
  //     this.excCfg.changeTitle(this.newTitle);
  //     this.newTitle = '';
  //   }
  //   if (this.newText.trim()) {
  //     this.excCfg.changeText(this.newText);
  //     this.newText = '';
  //   }
  // }
  // async selectImageFromGalleryExcuse() {
  //   try {
  //         const photo = await Camera.getPhoto({
  //           quality: 80,
  //           allowEditing: false,
  //           resultType: CameraResultType.Base64,
  //           source: CameraSource.Photos
  //         });

  //         if (photo && photo.base64String) {
  //           await this.excCfg.changeImageBase64(photo.base64String, photo.format);
  //         }
  //       } catch (e) {
  //         console.error('Error al seleccionar imagen:', e);
  //       }
  // }

  // ///Cambiar imagen de Logo
  // async selectImageLogo() {
  //   try {
  //     const photo = await Camera.getPhoto({
  //       quality: 80,
  //       allowEditing: false,
  //       resultType: CameraResultType.Base64,
  //       source: CameraSource.Photos
  //     });

  //     if (photo && photo.base64String) {
  //       await this.logoService.changeImageBase64(photo.base64String, photo.format);
  //     }
  //   } catch (e) {
  //     console.error('Error al seleccionar imagen:', e);
  //   }
  // }
}
