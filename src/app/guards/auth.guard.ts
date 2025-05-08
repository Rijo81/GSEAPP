import { Injectable } from "@angular/core";
import { SupabaseService } from "../services/supabase/supabase.service";
import { CanActivate, Router } from "@angular/router";

// auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private supabaseService: SupabaseService) {}

  async canActivate(): Promise<boolean> {
    const session = await this.supabaseService.getSession();
    if (session) {
      return true;
    } else {
      this.router.navigate(['/auth']);
      return false;
    }
  }
}
