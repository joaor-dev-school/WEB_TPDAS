import { CalendarEventAction } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils';
import { Observable, Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { DateModel } from '../../models/date.model';
import { EventCalendarTypeEnum } from '../event-calendar-type.enum';
import { EventTypeEnum } from '../event-type.enum';
import { EventListItemModel } from '../models/event-list-item.model';
import { EventListModel } from '../models/event-list.model';
import { EventParticipantModel } from '../models/event-participant.model';
import { EventColorsUtils } from './event-colors.utils';
import { FormType } from './event-form.utils';

type ActionsFn = (eventId: number) => CalendarEventAction[];

export const INPUT_DATE_FORMAT = 'MMMM Do YYYY, h:mm:ss a';
export const DURATION_FORMAT = 'h:mm';

export interface OpenModalModel {
  eventId?: number;
  eventType?: EventTypeEnum;
  type: FormType;
}

export interface CalendarEventSubjectModel {
  event: EventListItemModel;
  calendarEvents: CalendarEvent[];
}

export interface CalendarEventsSubjectModel {
  items: CalendarEventSubjectModel[];
}

export function toCalendarEvents(userId: number, onlyMyEvents: boolean):
  (source: Observable<CalendarEventsSubjectModel>) => Observable<CalendarEvent[]> {
  return (source: Observable<CalendarEventsSubjectModel>): Observable<CalendarEvent[]> => {
    let res: Observable<CalendarEventsSubjectModel> = source;
    if (onlyMyEvents) {
      res = res.pipe(toMyEvents(userId));
    }
    return res.pipe(map((event: CalendarEventsSubjectModel) =>
      event.items.map((eventItem: CalendarEventSubjectModel) => eventItem.calendarEvents)
        .reduce((prev: CalendarEvent[], cur: CalendarEvent[]) => [...prev, ...cur], [])));
  };
}

export function toEventsList(userId: number, onlyMyEvents: boolean):
  (source: Observable<CalendarEventsSubjectModel>) => Observable<EventListModel> {
  return (source: Observable<CalendarEventsSubjectModel>): Observable<EventListModel> => {
    let res: Observable<CalendarEventsSubjectModel> = source;
    if (onlyMyEvents) {
      res = res.pipe(toMyEvents(userId));
    }
    return res.pipe(map((event: CalendarEventsSubjectModel) => ({
      items: event.items.map((eventItem: CalendarEventSubjectModel) => eventItem.event)
    })));
  };
}

function toMyEvents(userId: number) {
  return (source: Observable<CalendarEventsSubjectModel>): Observable<CalendarEventsSubjectModel> => {
    return source.pipe(
      map((event: CalendarEventsSubjectModel) => ({
        items: event.items.filter((eventItem: CalendarEventSubjectModel) => !!eventItem.event.participants
          .find((participant: EventParticipantModel) => participant.participantId === userId))
      })));
  };
}

export function eventsModelToEventsCalendar(userId: number, editSubject: Subject<number>,
                                            deleteSubject: Subject<number>): (eventsList: EventListModel) => CalendarEventsSubjectModel {
  return (eventsList: EventListModel): CalendarEventsSubjectModel => {
    let events: CalendarEventSubjectModel[] = [];
    for (const event of eventsList.items) {
      console.log(event, createEventCalendar(event, userId === event.creator ? actions(editSubject, deleteSubject) : undefined));
      events = [...events, {
        calendarEvents: createEventCalendar(event, userId === event.creator ? actions(editSubject, deleteSubject) : undefined),
        event
      }];
    }
    return { items: events };
  };
}

function actions(editSubject: Subject<number>, deleteSubject: Subject<number>): ActionsFn {
  return (eventId: number) => [
    {
      label: '<i class="material-icons">edit</i>',
      a11yLabel: 'Edit',
      onClick: (): void => {
        editSubject.next(eventId);
      },
    },
    {
      label: '<i class="material-icons">delete_outline</i>',
      a11yLabel: 'Delete',
      onClick: (): void => {
        deleteSubject.next(eventId);
      },
    },
  ];
}

function createEventCalendar(event: EventListItemModel, action: ActionsFn): CalendarEvent[] {
  const eventCalendarType: EventCalendarTypeEnum = eventTypeToEventCalendarType(event.type, event.dates.length);
  return event.dates.map((eventDate: DateModel) => ({
    id: event.eventId,
    start: new Date(eventDate.timestamp),
    end: new Date(eventDate.timestamp + eventDate.duration),
    title: event.name,
    color: EventColorsUtils.getColor(eventCalendarType, event.dates.length),
    actions: action && action(event.eventId)
  }));
}

function eventTypeToEventCalendarType(eventType: EventTypeEnum, totalDates: number): EventCalendarTypeEnum {
  switch (eventType) {
    case EventTypeEnum.INVITE:
      return totalDates < 2 ? EventCalendarTypeEnum.INVITE_SIMPLE : EventCalendarTypeEnum.INVITE_PERIODIC;
    case EventTypeEnum.SCHEDULING_AUTOMATIC:
      return EventCalendarTypeEnum.SCHEDULING_AUTOMATIC;
    case EventTypeEnum.SCHEDULING_COLLABORATIVE:
      return EventCalendarTypeEnum.SCHEDULING_COLLABORATIVE;
    default:
      return null;
  }
}
