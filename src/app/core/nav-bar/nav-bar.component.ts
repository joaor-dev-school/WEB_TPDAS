import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBell, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActionsModalService } from '../../shared/actions-modal/actions-modal.service';
import { AlertModalManagerService } from '../../shared/alert-manager/alert-modal-manager.service';
import { createFormErrorAlert } from '../../shared/alert-manager/models/alert-modal.model';

import { AuthService } from '../../shared/auth/auth.service';
import { NotificationItemModel } from '../../shared/notifications/models/notification-item.model';
import { NotificationsService } from '../../shared/notifications/notifications.service';

/**
 * Navigation bar component.
 */
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {

  @HostBinding('class.nav-bar-container') navBarContainerClass: boolean = true;

  name: string;

  logoutIcon: IconDefinition = faSignOutAlt;

  profileIcon: IconDefinition = faUser;

  bellIcon: IconDefinition = faBell;

  notifications$: Observable<NotificationItemModel[]>;

  loadingNotification: number;

  notificationBadgeCounts: number;

  constructor(private readonly router: Router, private readonly authService: AuthService,
              private readonly actionsModalService: ActionsModalService, private readonly notificationsService: NotificationsService,
              private readonly alertService: AlertModalManagerService) {
    this.notificationBadgeCounts = 0;
  }

  /**
   * Handles initialization tasks.
   */
  ngOnInit(): void {
    this.name = this.authService.userName;
    this.notifications$ = this.notificationsService.notificationsObservable
      .pipe(tap((notifications: NotificationItemModel[]) => this.notificationBadgeCounts = notifications
        .filter((notification: NotificationItemModel) => !notification.read).length));
    this.notificationsService.initNotificationsSse();
  }

  ngOnDestroy(): void {
    this.notificationsService.destroyNewNotificationsSse();
  }

  /**
   * Opens the edit profile form drawer.
   */
  editProfile(): void {
    /*const title: string = 'profile.form.title';
    this.drawerService.create<ProfileFormDrawerComponent, ProfileDrawerParametersModel>({
      nzContent: ProfileFormDrawerComponent,
      nzWrapClassName: 'small-form-drawer form-drawer',
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        title
      }
    });*/
  }

  markAsReadUnread(notification: NotificationItemModel): void {
    this.loadingNotification = notification.id;
    this.notificationsService.markAsReadUnread(this.authService.userId, notification.id, !notification.read)
      .subscribe(
        () => this.loadingNotification = null,
        (error: HttpErrorResponse) => this.handleMarkAsReadUnread(error)
      );
  }

  logout(): void {
    this.router.navigate(['auth', 'login'])
      .catch((error: Error) => console.error(error));
  }

  openActionsModal(): void {
    this.actionsModalService.openModal$.next();
  }

  private handleMarkAsReadUnread(error: HttpErrorResponse): void {
    console.error(error);
    this.alertService.next(createFormErrorAlert(`Error trying change notification state`));
    this.loadingNotification = null;
  }
}
