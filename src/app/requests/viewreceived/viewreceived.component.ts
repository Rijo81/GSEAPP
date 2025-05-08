import { Component, OnInit } from '@angular/core';
import { RequestsI } from 'src/app/models/requests.models';
import { IonHeader, IonToolbar, IonButtons, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonContent, IonTitle, IonCardSubtitle, IonMenuButton, IonItem,
  IonList, IonPopover, IonAvatar, IonIcon, IonText } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {  GroupsI } from 'src/app/models/groups.models';
import { Router } from '@angular/router';
import { Models } from 'src/app/models/models';
import { GroupService } from 'src/app/services/crud/group.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { RequestsService } from 'src/app/services/requests/requests.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { delay, filter, firstValueFrom, retry, take, tap } from 'rxjs';
import { PopoverController } from '@ionic/angular/standalone';
import { UserMenuComponent } from 'src/app/components/user-menu/user-menu.component';

@Component({
  selector: 'app-viewreceived',
  templateUrl: './viewreceived.component.html',
  styleUrls: ['./viewreceived.component.scss'],
  standalone: true,
  imports: [IonText, IonIcon, IonAvatar, IonPopover, IonList, IonItem,  IonCardSubtitle,  IonTitle, IonContent, IonCardContent, IonCardTitle, IonCardHeader, IonCard,
    IonButtons, IonToolbar, IonHeader, FormsModule, CommonModule, IonMenuButton]
})
export class ViewreceivedComponent  implements OnInit {


  groups: GroupsI[] = [];
  requests: RequestsI[] = [];
  filteredRequests: RequestsI[] = [];
  iLogo: string = 'assets/logo.png';
  selectedUser: Models.User.UsersI | null = null;
  userPhoto: string = '';
  showUserMenu = false;

  constructor(
    private router: Router,
    private groupService: GroupService,
    private requestsService: RequestsService,
    private authSupabaseService: SupabaseService,
    private interactionService: InteractionService,
    private popoverCtrl: PopoverController
  ) {}

  objectKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj);
  }

  async ngOnInit() {
    this.authSupabaseService.sessionChanged
      .pipe(
        filter(session => !!session),
        take(1),
        tap(() => console.log('✅ Sesión lista')),
        delay(100),
        retry({ count: 3, delay: 1000 })
      )
      .subscribe( async () => {
        this.initializeRequestsView();
        console.log('📦 Todas las solicitudes obtenidas:', this.requests);
      });

      this.userPhoto =  await this.authSupabaseService.loadPhoto();
  }
      logout() {
        this.authSupabaseService.signOut();
        this.router.navigate(['/auth']);
      }
  async initializeRequestsView() {
    try {
      this.selectedUser = await this.authSupabaseService.getUserAppData();
      console.log('👤 Usuario actual:', this.selectedUser);
      console.log('🆔 Group ID del usuario:', this.selectedUser?.group_id);
      if (!this.selectedUser || !this.selectedUser.group_id) {
        console.error('⛔ Usuario no válido o sin group_id.');
        return;
      }

      const [groups, requests] = await Promise.all([
        firstValueFrom(this.groupService.getGroups()),
        firstValueFrom(this.requestsService.getRequests())
      ]);

      this.groups = groups;
      this.requests = requests;

      const userGroupId = this.selectedUser.group_id;
      const groupHierarchy = this.getAllRelatedGroups(userGroupId.id, this.groups);

      console.log('📚 Grupos cargados:', this.groups);
      console.log('🧭 Jerarquía de grupos del usuario:', groupHierarchy);
      this.filteredRequests = this.requests.filter(request =>
        request.group_destine && groupHierarchy.includes(request.group_destine.id)
      );

      console.log('🧠 Solicitudes filtradas:', this.filteredRequests);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.interactionService.showToast('Error al cargar datos.');
    }
  }

  getAllRelatedGroups(groupId: string, groups: GroupsI[]): string[] {
    const related = new Set<string>();

  // Subir en la jerarquía
    let current = groups.find(g => g.id === groupId);
    while (current) {
      related.add(current.id);
      current = groups.find(g => g.id === current.parentId);
    }

  // Bajar en la jerarquía recursivamente
  const collectChildren = (parentId: string) => {
    const children = groups.filter(g => g.parentId === parentId);
    for (const child of children) {
      if (!related.has(child.id)) {
        related.add(child.id);
        collectChildren(child.id);
      }
    }
  };

  collectChildren(groupId);

  return Array.from(related);
  }

  isImage(value: string): boolean {
    return typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'));
  }

  isStringOrNumber(value: any): boolean {
    return typeof value === 'string' || typeof value === 'number';
  }

  goToDetails(id: string) {
    this.router.navigate(['/details', id]);
  }

  changePassword(){
    this.router.navigate(['/changed-pass']);
  }
}
