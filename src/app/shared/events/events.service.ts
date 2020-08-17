import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EventListModel } from './models/event-list.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private readonly httpClient: HttpClient) {
  }

  fetchAll(): Observable<EventListModel> {
    return this.httpClient.get<EventListModel>(`${environment.apiConfig.path}/events`);
  }
}
