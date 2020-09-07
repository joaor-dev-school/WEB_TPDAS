import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Params, Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly router: Router, private readonly authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.checkLogin(route.queryParams, state.url);
  }

  private checkLogin(queryParams: Params, url: string): Promise<boolean> {
    return new Promise<boolean>((resolve: (value: boolean) => void): void => {
      this.authService.setRedirectUrl(url);
      this.authService.checkSession()
        .then((sessionActive: boolean) => {
          if (!sessionActive) {
            this.router.navigate(['/auth/login'], { queryParams })
              .catch(() => console.warn(AuthGuard.name, 'Navigation to login has failed in Auth Guard'));
          }
          resolve(sessionActive);
        });
    });
  }
}
