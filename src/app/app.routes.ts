import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'user-supabase',
    canActivate: [AuthGuard],
    loadComponent: () => import('./auth/crud/users/users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () => import('./home/home/home.component').then(h => h.HomeComponent),
  },
  {
    path: 'screen-excuse',
    canActivate: [AuthGuard],
    loadComponent: () => import('./home/excuse/excuse.component').then(excuse => excuse.ExcuseComponent),
  },
  {
    path: 'config',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/configuration/configuration.component').then(config => config.ConfigurationComponent),
  },

  {
    path: 'configuration',
    component: ConfigurationComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'changed-pass',
    loadComponent: () => import('./auth/reset-password/changed-password/changed-password.component').then(reset => reset.ChangedPasswordComponent),
  },
  {
    path: 'forgot',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(forgot => forgot.ForgotPasswordComponent),
  },
  {
    path: 'group',
    canActivate: [AuthGuard],
    loadComponent: () => import('./groups/groups/groups.component').then(m => m.GroupsComponent),
  },
  {
    path: 'state',
    canActivate: [AuthGuard],
    loadComponent: () => import('./states/state/state.component').then(m => m.StateComponent),
  },
  {
    path: 'requestsfire',
    canActivate: [AuthGuard],
    loadComponent: () => import('./requests/requests/requests.component').then(m => m.RequestsComponent),
  },
  {
    path: 'trequests',
    canActivate: [AuthGuard],
    loadComponent: () => import('./requests/type-requests/typerequests/typerequests.component').then(m => m.TyperequestsComponent),
  },
  {
    path: 'view-excuse',
    canActivate: [AuthGuard],
    loadComponent: () => import('./requests/viewreceived/viewreceived.component').then(m => m.ViewreceivedComponent),
  },
  {
    path: 'details/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./requests/detail-requests/detail-requests.component').then(detail => detail.DetailRequestsComponent),
  },
  {
    path: 'access',
    loadComponent: () => import('./auth/access-reqt/access-reqt.component').then(access => access.AccessReqtComponent),
  },
  {
    path: 'show-access',
    canActivate: [AuthGuard],
    loadComponent: () => import('./auth/show-access-requests/show-access-requests.component').then(show => show.ShowAccessRequestsComponent),
  },
  {
    path: 'details-access/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./auth/show-access-requests/details-access/details-access.component').then(detail => detail.DetailsAccessComponent),
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
];
