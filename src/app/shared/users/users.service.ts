import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserModel } from './models/user.model';
import { UsersListModel } from './models/users-list.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private readonly httpClient: HttpClient) {
  }

  fetchAll(): Observable<UsersListModel> {
    return this.httpClient.get<UsersListModel>(`${environment.apiConfig.path}/user/all`);
  }

  fetchById(userId: number): Observable<UserModel> {
    return this.httpClient.get<UserModel>(`${environment.apiConfig.path}/user/${userId}`);
  }
}
