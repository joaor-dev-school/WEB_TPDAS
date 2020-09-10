import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { CalendarEvent, CalendarView } from 'angular-calendar';
import { isSameDay, isSameMonth, } from 'date-fns';
import { BehaviorSubject, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, filter, map, take } from 'rxjs/operators';
import { ActionsModalService } from '../shared/actions-modal/actions-modal.service';

import { AlertModalManagerService } from '../shared/alert-manager/alert-modal-manager.service';
import { createFormErrorAlert, createFormSuccessAlert, createListErrorAlert } from '../shared/alert-manager/models/alert-modal.model';
import { AuthService } from '../shared/auth/auth.service';
import { EventsService } from '../shared/events/events.service';
import { EventListModel } from '../shared/events/models/event-list.model';
import { FormType } from '../shared/events/utils/event-form.utils';
import {
  CalendarEventsSubjectModel,
  eventsModelToEventsCalendar,
  OpenModalModel,
  toCalendarEvents,
  toEventsList
} from '../shared/events/utils/events.utils';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {

  view: CalendarView = CalendarView.Month;

  viewDate: Date = new Date();

  refresh: Subject<any> = new Subject();

  openModal$: Observable<OpenModalModel>;

  openActionsModal$: Observable<OpenModalModel>;

  activeDayIsOpen: boolean = false;

  historyOperationLoading: boolean = false;

  isOnlyMyEvents: boolean;

  hasUndo$: Observable<boolean>;

  hasRedo$: Observable<boolean>;

  calendarEvents$: Observable<CalendarEvent[]>;

  events$: Observable<EventListModel>;

  myEvents$: Observable<EventListModel>;

  get CalendarView(): typeof CalendarView {
    return CalendarView;
  }

  private readonly editEventSubject: Subject<number>;
  private readonly deleteEventSubject: Subject<number>;
  private readonly eventsSubject: BehaviorSubject<CalendarEventsSubjectModel>;
  private readonly openModalSubject: Subject<OpenModalModel>;
  private readonly openActionsModalSubject: Subject<OpenModalModel>;
  private readonly subscriptions: Subscription[];

  constructor(private readonly eventsService: EventsService, private readonly authService: AuthService,
              private readonly alertService: AlertModalManagerService, private readonly actionsService: ActionsModalService) {
    this.subscriptions = [];
    this.editEventSubject = new Subject();
    this.deleteEventSubject = new Subject();
    this.openModalSubject = new Subject();
    this.openActionsModalSubject = new Subject();
    this.eventsSubject = new BehaviorSubject({ items: [] });
    this.openModal$ = this.openModalSubject.asObservable();
    this.openActionsModal$ = this.openActionsModalSubject.asObservable();
    this.hasUndo$ = this.eventsService.hasUndo$;
    this.hasRedo$ = this.eventsService.hasRedo$;
    this.isOnlyMyEvents = true;
    this.myEvents$ = this.eventsSubject.pipe(toEventsList(this.authService.userId, true),
      filter((eventsList: EventListModel) => !!eventsList));
    this.updateEventObservables();
  }

  ngOnInit() {
    this.eventsService.resetCountChanges(this.authService.userId)
      .subscribe(() => {
        // Empty by design.
      });
    this.subscriptions.push(this.actionsService.changesMade.subscribe(() => this.eventStatusChanged()));
    this.subscribeForEventActions();
    this.fetchEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  fetchEvents(): void {
    this.eventsService.fetchAll().pipe(
      take(1),
      catchError((error: HttpErrorResponse) => this.handleFetchAllEventsError(error)),
      map(eventsModelToEventsCalendar(this.authService.userId, this.editEventSubject, this.deleteEventSubject))
    )
      .subscribe((event: CalendarEventsSubjectModel) => this.eventsSubject.next(event));
  }

  eventStatusChanged(): void {
    this.fetchEvents();
  }

  addEvent(type: FormType, eventId: number = null): void {
    this.openModalSubject.next({ eventId, type });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0);
      this.viewDate = date;
    }
  }

  openDetails(event: CalendarEvent): void {
    this.openModalSubject.next({ type: 'details', eventId: Number(event.id) });
  }

  setView(view: CalendarView) {
    this.view = view;
    this.activeDayIsOpen = false;
  }

  setViewDate(date: Date): void {
    this.viewDate = date;
    this.activeDayIsOpen = false;
  }

  handleHistoryClick(operationType: 'undo' | 'redo') {
    const userId: number = this.authService.userId;

    this.historyOperationLoading = true;
    (operationType === 'undo' ? this.eventsService.undo(userId) : this.eventsService.redo(userId))
      .pipe(take(1))
      .subscribe(() => this.handleHistoryClickSuccess(operationType),
        (error: HttpErrorResponse) => this.handleHistoryClickError(operationType, error),
        () => this.historyOperationLoading = false);
  }

  changeOnlyMyEventsState(state: boolean): void {
    this.isOnlyMyEvents = state;
    this.updateEventObservables();
  }

  private updateEventObservables(): void {
    this.events$ = this.eventsSubject.pipe(toEventsList(this.authService.userId, this.isOnlyMyEvents));
    this.calendarEvents$ = this.eventsSubject.pipe(toCalendarEvents(this.authService.userId, this.isOnlyMyEvents));
  }

  private subscribeForEventActions(): void {
    this.subscriptions.push(
      merge(
        this.editEventSubject.pipe(map((eventId: number) => ({ eventId, type: 'edit' } as OpenModalModel))),
        this.deleteEventSubject.pipe(map((eventId: number) => ({ eventId, type: 'delete' } as OpenModalModel)))
      ).subscribe((formAction: OpenModalModel) => this.openModalSubject.next(formAction))
    );
  }

  // Handlers
  private handleFetchAllEventsError(error: HttpErrorResponse): Observable<EventListModel> {
    console.error('Error fetching all events', error);
    this.alertService.next(createListErrorAlert(`Error fetching all events! Please try again later...`));
    return of({ items: [] });
  }

  private handleHistoryClickSuccess(type: 'undo' | 'redo'): void {
    this.fetchEvents();
    this.alertService.next(createFormSuccessAlert(`Operation ${type} applied`));
  }

  private handleHistoryClickError(type: 'undo' | 'redo', error: HttpErrorResponse): void {
    console.error(`Error executing history operation (${type})`, error);
    this.alertService.next(createFormErrorAlert(`Error trying to ${type} the operation! Operation history will be reset`));
    this.eventsService.resetCountChanges(this.authService.userId);
  }
}
