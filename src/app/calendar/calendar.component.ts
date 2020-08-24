import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { CalendarEvent, CalendarView } from 'angular-calendar';
import { isSameDay, isSameMonth, } from 'date-fns';
import { merge, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { AuthService } from '../shared/auth/auth.service';
import { EventTypeEnum } from '../shared/events/event-type.enum';
import { EventsService } from '../shared/events/events.service';
import { EventListModel } from '../shared/events/models/event-list.model';
import { FormType } from '../shared/events/utils/event-form.utils';
import { eventsModelToEventsCalendar, OpenModalModel } from '../shared/events/utils/events.utils';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {

  view: CalendarView = CalendarView.Month;

  viewDate: Date = new Date();

  refresh: Subject<any> = new Subject();

  calendarEvents$: Observable<CalendarEvent[]>;

  openModal$: Observable<OpenModalModel>;

  activeDayIsOpen: boolean = false;

  private readonly editEventSubject: Subject<number>;
  private readonly deleteEventSubject: Subject<number>;
  private readonly calendarEventsSubject: Subject<CalendarEvent[]>;
  private readonly openModalSubject: Subject<OpenModalModel>;
  private readonly subscriptions: Subscription[];

  get CalendarView(): typeof CalendarView {
    return CalendarView;
  }

  constructor(private readonly eventsService: EventsService, private readonly authService: AuthService) {
    this.subscriptions = [];
    this.editEventSubject = new Subject();
    this.deleteEventSubject = new Subject();
    this.calendarEventsSubject = new Subject();
    this.calendarEvents$ = this.calendarEventsSubject.asObservable();
    this.openModalSubject = new Subject();
    this.openModal$ = this.openModalSubject.asObservable();
  }

  ngOnInit() {
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
      .subscribe((events: CalendarEvent[]) => this.calendarEventsSubject.next(events));
  }

  addEvent(type: FormType, eventId: number = null): void {
    this.openModalSubject.next({ eventId, type });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  openDetails(event: CalendarEvent): void {
    this.openModalSubject.next({ type: 'details', eventId: Number(event.id) });
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  setViewDate(date: Date): void {
    this.viewDate = date;
    this.activeDayIsOpen = false;
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
    console.error(error);
    return of({ items: [] });
  }

}
