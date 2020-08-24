import { CalendarEventAction } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils';
import { Subject } from 'rxjs';

import { DateModel } from '../../models/date.model';
import { EventCalendarTypeEnum } from '../event-calendar-type.enum';
import { EventTypeEnum } from '../event-type.enum';
import { EventListItemModel } from '../models/event-list-item.model';
import { EventListModel } from '../models/event-list.model';
import { EventColorsUtils } from './event-colors.utils';
import { FormType } from './event-form.utils';

type ActionsFn = (eventId: number) => CalendarEventAction[];

export interface OpenModalModel {
  eventId?: number;
  eventType?: EventTypeEnum;
  type: FormType;
}

export function eventsModelToEventsCalendar(userId: number, editSubject: Subject<number>,
                                            deleteSubject: Subject<number>): (eventsList: EventListModel) => CalendarEvent[] {
  return (eventsList: EventListModel): CalendarEvent[] => {
    let calendarEvents: CalendarEvent[] = [];
    for (const event of eventsList.items) {
      calendarEvents = [...calendarEvents, ...createEventCalendar(event, userId === event.creator
        ? actions(editSubject, deleteSubject) : undefined)];
    }
    return calendarEvents;
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
    color: EventColorsUtils.getColor(eventCalendarType),
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
