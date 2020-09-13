import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { NotificationItemModel } from './models/notification-item.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  /**
   * The new notifications observable.
   */
  get notificationsObservable(): Observable<NotificationItemModel[]> {
    return this.notificationsSubject.pipe(map((notificationMap: Map<number, NotificationItemModel>) => [...notificationMap.values()]));
  }

  private subscription: Subscription;
  private readonly notificationsSubject: BehaviorSubject<Map<number, NotificationItemModel>>;
  private readonly stopNotificationsSubject: Subject<void>;

  constructor(private zone: NgZone, private readonly authService: AuthService, private readonly httpClient: HttpClient) {
    this.notificationsSubject = new BehaviorSubject(new Map());
    this.stopNotificationsSubject = new Subject();
  }

  addNotifications(...notifications: NotificationItemModel[]): void {
    const targetMap: Map<number, NotificationItemModel> = new Map();
    const currentMap: Map<number, NotificationItemModel> = this.notificationsSubject.value;
    notifications.forEach((notification: NotificationItemModel) => !currentMap.get(notification.id)
      && targetMap.set(notification.id, notification));
    if (targetMap.size) {
      this.notificationsSubject.next(targetMap);
    }
  }

  markAsReadUnread(userId: number, notificationId: number, read: boolean): Observable<void> {
    return this.httpClient.put<void>(`${environment.apiConfig.path}/user/notifications/state`, { userId, notificationId, read })
      .pipe(tap(() => {
        const m: Map<number, NotificationItemModel> = new Map(this.notificationsSubject.value);
        m.get(notificationId).read = read;
        this.notificationsSubject.next(m);
      }));
  }

  initNotificationsSse(): void {
    this.subscription = timer(0, 5000)
      .pipe(
        takeUntil(this.stopNotificationsSubject),
        switchMap(() => this.httpClient.get(`${environment.apiConfig.path}/user/notifications/${this.authService.userId}`))
      )
      .subscribe(
        (notifications: NotificationItemModel[]) => this.addNotifications(...notifications),
        (error: HttpErrorResponse) => {
          console.error(error);
          this.destroyNewNotificationsSse();
        },
        () => this.destroyNewNotificationsSse()
      );
  }

  destroyNewNotificationsSse(): void {
    this.subscription?.unsubscribe();
    this.stopNotificationsSubject.next();
    this.notificationsSubject.next(new Map());
  }
}
