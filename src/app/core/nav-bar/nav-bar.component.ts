import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { ActionsModalService } from '../../shared/actions-modal/actions-modal.service';

import { AuthService } from '../../shared/auth/auth.service';

/**
 * Navigation bar component.
 */
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  @HostBinding('class.nav-bar-container') navBarContainerClass: boolean = true;

  name: string;

  logoutIcon: IconDefinition = faSignOutAlt;

  profileIcon: IconDefinition = faUser;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly actionsModalService: ActionsModalService
  ) {
  }

  /**
   * Handles initialization tasks.
   */
  ngOnInit(): void {
    this.name = this.authService.userName;
  }

  /**
   * Opens the edit profile form drawer.
   */
  editProfile(): void {
    this.router
      .navigate(['edit-profile'])
      .catch((error: Error) => console.error(error));
  }

  logout(): void {
    this.router
      .navigate(['auth', 'login'])
      .catch((error: Error) => console.error(error));
  }

  openActionsModal(): void {
    this.actionsModalService.openModal$.next();
  }
}
