import { animate, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { formatDate } from 'ngx-bootstrap/chronos';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AlertModalManagerService } from '../../shared/alert-manager/alert-modal-manager.service';
import { createFormErrorAlert, createFormSuccessAlert } from '../../shared/alert-manager/models/alert-modal.model';
import { AuthService } from '../../shared/auth/auth.service';
import { EventParticipantStateEnum } from '../../shared/events/event-participant-state.enum';
import { EventTypeEnum, eventTypesList } from '../../shared/events/event-type.enum';
import { EventsService } from '../../shared/events/events.service';
import { EventCollaborativeStatusChangesModel } from '../../shared/events/models/event-collaborative-status-changes.model';
import { EventListItemModel } from '../../shared/events/models/event-list-item.model';
import { EventListModel } from '../../shared/events/models/event-list.model';
import { EventParticipantModel } from '../../shared/events/models/event-participant.model';
import { EventUserStateViewDateModel } from '../../shared/events/models/event-user-state-view-date.model';
import { EventUserStateViewModel } from '../../shared/events/models/event-user-state-view.model';
import { EventUserStateModel } from '../../shared/events/models/event-user-state.model';
import { formattedTime } from '../../shared/events/utils/event-form.utils';
import { DURATION_FORMAT, INPUT_DATE_FORMAT } from '../../shared/events/utils/events.utils';
import { DateModel } from '../../shared/models/date.model';

@Component({
  selector: 'app-user-events-table',
  templateUrl: './user-events-table.component.html',
  styleUrls: ['./user-events-table.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(200, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(200, style({ opacity: 0 }))
      ])
    ])

  ]
})
export class UserEventsTableComponent {

  @Input() set eventsList(list: EventListModel) {
    const userId: number = this.authService.userId;
    this._eventsList = list;
    this.eventsSubject.next(list.items
      .filter((eventItem: EventListItemModel) => {
        const nowMillis: number = new Date().getTime();
        return !!eventItem.dates.find((date: DateModel) => (date.timestamp + date.duration) > nowMillis);
      })
      .map((eventItem: EventListItemModel) => {
        return {
          userId,
          userState: eventItem.participants.find((participant: EventParticipantModel) =>
            participant.participantId === userId)?.state || EventParticipantStateEnum.NEW,
          eventId: eventItem.eventId,
          eventName: eventItem.name,
          eventDates: eventItem.dates,
          eventType: eventItem.type,
          eventDatesView: eventItem.dates.map((date: DateModel) => ({
            time: date.timestamp,
            date: `${formatDate(new Date(date.timestamp), INPUT_DATE_FORMAT)} (${
              formattedTime(date.duration, DURATION_FORMAT).split(':').join('h ')}m)`,
            preferences: eventItem.type === EventTypeEnum.SCHEDULING_COLLABORATIVE
              ? { acceptable: false, preferred: false } : null
          }))
        };
      }));
  }

  @Output() eventStatusChanged: EventEmitter<void>;

  get EventParticipantStateEnum(): typeof EventParticipantStateEnum {
    return EventParticipantStateEnum;
  }

  eventsMap$: Map<EventTypeEnum, Observable<EventUserStateViewModel[]>>;

  eventTypesList: EventTypeEnum[];

  selectedEvent: EventUserStateModel;

  private _eventsList: EventListModel;
  private readonly eventsSubject: BehaviorSubject<EventUserStateViewModel[]>;

  @HostListener('document:click')
  onDocumentClick(): void {
    this.selectedEvent = null;
  }

  constructor(private readonly authService: AuthService, private readonly alertService: AlertModalManagerService,
              private readonly eventsService: EventsService) {
    this.eventStatusChanged = new EventEmitter();
    this.eventsSubject = new BehaviorSubject([]);
    this.eventsMap$ = new Map();
    this.eventTypesList = eventTypesList();
    this.fillEventsMap();
  }

  changeStatus(event: EventUserStateViewModel, newState: EventParticipantStateEnum, $event: MouseEvent,
               nextSelectedEvent: EventUserStateModel = null): void {
    const statusUpdate: EventCollaborativeStatusChangesModel = {
      userId: this.authService.userId,
      status: newState,
      acceptableTimestamps: event.eventDatesView.filter((date: EventUserStateViewDateModel) => !!date.preferences?.acceptable)
        .map((date: EventUserStateViewDateModel) => date.time),
      preferredTimestamps: event.eventDatesView.filter((date: EventUserStateViewDateModel) => !!date.preferences?.preferred)
        .map((date: EventUserStateViewDateModel) => date.time)
    };

    const previousState: EventParticipantStateEnum = event.userState;
    event.userState = newState;
    $event.stopPropagation();

    (event.eventType === EventTypeEnum.SCHEDULING_COLLABORATIVE
      ? this.eventsService.updateCollaborativeStatus(event.eventId, statusUpdate)
      : this.eventsService.updateSimpleStatus(event.eventId, statusUpdate))
      .pipe(take(1))
      .subscribe(
        () => {
          this.eventStatusChanged.emit();
          this.selectedEvent = nextSelectedEvent;
          this.alertService.next(createFormSuccessAlert(`User status changed on event`));
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          event.userState = previousState;
          this.alertService.next(createFormErrorAlert(`Unable to change the user status on event`));
        }
      );
  }

  showPreferences(event: EventUserStateViewModel): boolean {
    return event.userState === EventParticipantStateEnum.NEW && event.eventType === EventTypeEnum.SCHEDULING_COLLABORATIVE;
  }

  private fillEventsMap(): void {
    this.eventTypesList.forEach((eventType: EventTypeEnum) => this.eventsMap$.set(eventType,
      this.eventsSubject.pipe(map((events: EventUserStateViewModel[]) =>
        events.filter((event: EventUserStateModel) => event.eventType === eventType)))));
  }

}
