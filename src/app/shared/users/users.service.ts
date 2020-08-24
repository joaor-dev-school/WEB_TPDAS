import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
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
}
