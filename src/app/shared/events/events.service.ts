import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { BooleanStateModel } from '../models/boolean-state.model';
import { EventCollaborativeStatusChangesModel } from './models/event-collaborative-status-changes.model';
import { EventDetailsModel } from './models/event-details.model';
import { EventListModel } from './models/event-list.model';
import { EventStatusChangesModel } from './models/event-status-changes.model';
import { InviteSubmitModel } from './models/invite-submit.model';
import { SchedulingSubmitModel } from './models/scheduling-submit.model';
import { createOperationModel } from './models/user-event-operation.model';

interface ChangesHistoryModel {
  hasUndo: boolean;
  hasRedo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  get hasRedo$(): Observable<boolean> {
    return this.countChangesSubject.pipe(map((changes: ChangesHistoryModel) => changes.hasRedo));
  }

  get hasUndo$(): Observable<boolean> {
    return this.countChangesSubject.pipe(map((changes: ChangesHistoryModel) => changes.hasUndo));
  }

  private countChangesSubject: BehaviorSubject<ChangesHistoryModel>;

  constructor(private readonly httpClient: HttpClient, private readonly authService: AuthService) {
    this.countChangesSubject = new BehaviorSubject({ hasRedo: false, hasUndo: false });
  }

  fetchAll(): Observable<EventListModel> {
    return this.httpClient.get<EventListModel>(`${environment.apiConfig.path}/events`);
  }

  fetch(eventId: number): Observable<EventDetailsModel> {
    return this.httpClient.get<EventDetailsModel>(`${environment.apiConfig.path}/events/${eventId}`);
  }

  createInvite(event: InviteSubmitModel): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiConfig.path}/events/invite`, event)
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  editInvite(eventId: number, event: InviteSubmitModel): Observable<void> {
    return this.httpClient.put<void>(`${environment.apiConfig.path}/events/invite/${eventId}`, event)
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  createScheduling(event: SchedulingSubmitModel): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiConfig.path}/events/scheduling`, event)
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  editScheduling(eventId: number, event: SchedulingSubmitModel): Observable<void> {
    return this.httpClient.put<void>(`${environment.apiConfig.path}/events/scheduling/${eventId}`, event)
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  delete(eventId: number): Observable<void> {
    return this.httpClient.delete<void>(`${environment.apiConfig.path}/events/${eventId}`)
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  undo(userId: number): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiConfig.path}/events/operationUndo`, createOperationModel(userId))
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  redo(userId: number): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiConfig.path}/events/operationRedo`, createOperationModel(userId))
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  resetCountChanges(userId: number): Observable<void> {
    return this.httpClient.post<void>(`${environment.apiConfig.path}/events/resetRecord`, createOperationModel(userId))
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  updateSimpleStatus(eventId: number, status: EventStatusChangesModel): Observable<void> {
    return this.httpClient.patch<void>(`${environment.apiConfig.path}/events/simple-status/${eventId}`, status)
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  updateCollaborativeStatus(eventId: number, status: EventCollaborativeStatusChangesModel): Observable<void> {
    return this.httpClient.patch<void>(`${environment.apiConfig.path}/events/collaborative-status/${eventId}`, status)
      .pipe(tap(() => this.updateChangesHistoryState()));
  }

  private updateChangesHistoryState(): void {
    const userId: number = this.authService.userId;
    forkJoin([
      this.httpClient.get<BooleanStateModel>(`${environment.apiConfig.path}/events/hasUndo/${userId}`),
      this.httpClient.get<BooleanStateModel>(`${environment.apiConfig.path}/events/hasRedo/${userId}`)
    ])
      .subscribe(([hasUndoState, hasRedoState]: [BooleanStateModel, BooleanStateModel]) =>
          this.countChangesSubject.next({
            hasUndo: hasUndoState.state,
            hasRedo: hasRedoState.state
          }),
        (error: HttpErrorResponse) => {
          console.error(error);
          this.resetCountChanges(userId)
            .subscribe(() => {
              // Empty by design.
            });
          this.countChangesSubject.next({ hasRedo: false, hasUndo: false });
        });
  }
}
