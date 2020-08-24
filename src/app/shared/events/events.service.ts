import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EventDetailsModel } from './models/event-details.model';
import { EventListModel } from './models/event-list.model';
import { EventSubmitModel } from './models/event-submit.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private readonly httpClient: HttpClient) {
  }

  fetchAll(): Observable<EventListModel> {
    return this.httpClient.get<EventListModel>(`${environment.apiConfig.path}/events`);
  }

  fetch(eventId: number): Observable<EventDetailsModel> {
    return this.httpClient.get<EventDetailsModel>(`${environment.apiConfig.path}/events/${eventId}`);
  }

  createInvite(event: EventSubmitModel): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiConfig.path}/events/invite`, event);
  }

  editInvite(eventId: number, event: EventSubmitModel): Observable<void> {
    return this.httpClient.put<void>(`${environment.apiConfig.path}/events/invite/${eventId}`, event);
  }

  delete(eventId: number): Observable<void> {
    return this.httpClient.delete<void>(`${environment.apiConfig.path}/events/${eventId}`);
  }
}
