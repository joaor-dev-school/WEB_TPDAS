import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserSchedulingPreferencesModel } from '../edit-profile/models/user-scheduling-preferences.model';
import { NotificationItemModel } from '../notifications/models/notification-item.model';
import { BooleanMessage } from '../messages/boolean.message';
import { EmptyMessage } from '../messages/empty.message';
import { ErrorResponseMessage } from '../messages/error-response.message';
import { UserModel } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { CreateUserModel } from './models/create-user.model';
import { LoginModel } from './models/login.model';

const STORAGE_USER_ID_KEY: string = 'user-id';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  get userId(): number {
    return this.user?.id;
  }

  get userName(): string {
    return this.user?.name;
  }

  get userNotifications(): NotificationItemModel[] {
    return this.user?.notifications;
  }

  private redirectUrl: string;
  private user: UserModel;
  private readonly storage: Storage;

  constructor(private readonly httpClient: HttpClient, private readonly router: Router, private readonly usersService: UsersService) {
    this.storage = localStorage;
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  checkSession(): Promise<boolean> {
    return new Promise((resolve: BooleanMessage): void => {
      const userId: number = +this.storage.getItem(STORAGE_USER_ID_KEY);
      if (!userId || isNaN(userId)) {
        this.storage.removeItem(STORAGE_USER_ID_KEY);
        return resolve(false);
      }
      this.usersService
        .fetchById(userId)
        .pipe(take(1))
        .subscribe(
          (userRes: UserModel) => {
            this.user = userRes;
            resolve(true);
          },
          (error: HttpErrorResponse) => {
            console.error(error);
            resolve(false);
          }
        );
    });
  }

  login(loginModel: LoginModel): Promise<void> {
    return new Promise((resolve: () => void, reject: (error: HttpErrorResponse) => void): void => {
      this.httpClient.post(`${environment.apiConfig.path}/auth/login`, loginModel)
        .subscribe(
          (res: UserModel) => {
            this.setSession(res);
            resolve();
          },
          (error: HttpErrorResponse) => reject(error)
        );
    });
  }

  logout(): Promise<void> {
    return new Promise((resolve: EmptyMessage, reject: ErrorResponseMessage): void => {
        this.storage.removeItem(STORAGE_USER_ID_KEY);
        if (!this.user) {
          resolve();
          return;
        }
        this.httpClient
          .post(`${environment.apiConfig.path}/auth/logout`, { userId: this.userId, })
          .subscribe(
            () => resolve(),
            (error: HttpErrorResponse) => reject(error)
          );
        this.user = null;
      }
    );
  }

  createUser(user: CreateUserModel): Promise<void> {
    return new Promise((resolve: () => void, reject: (error: HttpErrorResponse) => void): void => {
      this.httpClient
        .post(`${environment.apiConfig.path}/auth/register`, user)
        .subscribe(
          () => resolve(),
          (error: HttpErrorResponse) => reject(error)
        );
    });
  }

  redirectToPreviousUrl(): Promise<boolean> {
    const res: Promise<boolean> = this.router.navigate(
      this.redirectUrl?.split('/') || [''],
      { replaceUrl: true }
    );
    this.redirectUrl = null;
    return res;
  }

  changeUserName(name: string): Promise<void> {
    return new Promise((resolve: EmptyMessage, reject: ErrorResponseMessage): void => {
      this.httpClient.put(`${environment.apiConfig.path}/user/change-name`, { userId: this.userId, name })
        .subscribe(
          () => resolve(),
          (error: HttpErrorResponse) => reject(error)
        );
    });
  }

  changeUserPassword(password: string): Promise<void> {
    return new Promise((resolve: EmptyMessage, reject: ErrorResponseMessage): void => {
      this.httpClient.put(`${environment.apiConfig.path}/auth/change-password`, { userId: this.userId, password })
        .subscribe(
          () => resolve(),
          (error: HttpErrorResponse) => reject(error)
        );
    });
  }

  checkPassword(password: string): Promise<void> {
    return new Promise((resolve: EmptyMessage, reject: ErrorResponseMessage): void => {
      if (!this.user) {
        return reject({ status: 0 } as HttpErrorResponse);
      }
      this.httpClient
        .post(`${environment.apiConfig.path}/auth/check-password`, { username: this.user.username, password })
        .subscribe(
          () => resolve(),
          (error: HttpErrorResponse) => reject(error)
        );
    });
  }

  changePreferences(preferences: UserSchedulingPreferencesModel): Promise<void> {
    return new Promise((resolve: EmptyMessage, reject: ErrorResponseMessage): void => {
      this.httpClient.put(`${environment.apiConfig.path}/user/calendar_preferences`, preferences)
        .subscribe(
          () => resolve(),
          (error: HttpErrorResponse) => reject(error)
        );
    });
  }

  private setSession(user: UserModel): void {
    this.storage.setItem(STORAGE_USER_ID_KEY, `${user.id}`);
    this.user = user;
  }
}
