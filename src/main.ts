import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({backButtonText: '', innerHTMLTemplatesEnabled: true}),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    ScreenTrackingService,
    UserTrackingService,
  ],
});
