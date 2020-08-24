import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userId: number;

  constructor() {
    this.userId = 1; // TODO: Obtain this on login.
  }
}
