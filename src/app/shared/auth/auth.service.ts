import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { take } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { UserModel } from "../users/models/user.model";
import { UsersService } from "../users/users.service";
import { LoginResponseModel } from "./models/login-response.model";
import { LoginModel } from "./models/login.model";

const STORAGE_USER_ID_KEY: string = "user-id";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  get userId(): number {
    return this.user?.id;
  }

  get userName(): string {
    return this.user?.name;
  }

  get userPass(): string {
    return this.user?.username;
  }

  private redirectUrl: string;
  private user: UserModel;
  private readonly storage: Storage;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    private readonly usersService: UsersService
  ) {
    this.storage = localStorage;
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  checkSession(): Promise<boolean> {
    return new Promise((resolve: (value: boolean) => void): void => {
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
    return new Promise(
      (
        resolve: () => void,
        reject: (error: HttpErrorResponse) => void
      ): void => {
        this.httpClient
          .post(`${environment.apiConfig.path}/auth/login`, loginModel)
          .subscribe(
            (res: LoginResponseModel) => {
              this.setSession(res);
              resolve();
            },
            (error: HttpErrorResponse) => reject(error)
          );
      }
    );
  }

  logout(): Promise<void> {
    return new Promise(
      (
        resolve: () => void,
        reject: (error: HttpErrorResponse) => void
      ): void => {
        this.storage.removeItem(STORAGE_USER_ID_KEY);
        if (!this.user) {
          resolve();
          return;
        }
        this.httpClient
          .post(`${environment.apiConfig.path}/auth/logout`, {
            userId: this.userId,
          })
          .subscribe(
            () => resolve(),
            (error: HttpErrorResponse) => reject(error)
          );
        this.user = null;
      }
    );
  }

  redirectToPreviousUrl(): Promise<boolean> {
    const res: Promise<boolean> = this.router.navigate(
      this.redirectUrl?.split("/") || [""],
      { replaceUrl: true }
    );
    this.redirectUrl = null;
    return res;
  }

  private setSession(session: LoginResponseModel): void {
    this.storage.setItem(STORAGE_USER_ID_KEY, `${session.user.id}`);
    this.user = session.user;
  }

  getUserInPassword(userId): Promise<void> {
    return new Promise(
      (
        resolve: () => void,
        reject: (error: HttpErrorResponse) => void
      ): void => {
        this.storage.removeItem(STORAGE_USER_ID_KEY);
        if (!this.user) {
          resolve();
          return;
        }
        this.httpClient
          .post(`${environment.apiConfig.path}/verify_passaword`, {
            userId: this.userId,
          })
          .subscribe(
            () => resolve(),
            (error: HttpErrorResponse) => reject(error)
          );
        this.user = null;
      }
    );
  }
}
