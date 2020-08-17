import { CalendarEvent } from 'calendar-utils';

import { DateModel } from '../../models/date.model';
import { EventCalendarTypeEnum } from '../event-calendar-type.enum';
import { EventTypeEnum } from '../event-type.enum';
import { EventListItemModel } from '../models/event-list-item.model';
import { EventListModel } from '../models/event-list.model';
import { EventColorsUtils } from './event-colors.utils';

export function eventsModelToEventsCalendar(eventsList: EventListModel): CalendarEvent[] {
  let calendarEvents: CalendarEvent[] = [];
  for (const event of eventsList.items) {
    calendarEvents = [...calendarEvents, ...createEventCalendar(event)];
  }
  return calendarEvents;
}

function createEventCalendar(event: EventListItemModel): CalendarEvent[] {
  const eventCalendarType: EventCalendarTypeEnum = eventTypeToEventCalendarType(event.type, event.dates.length);
  return event.dates.map((eventDate: DateModel) => ({
    start: new Date(eventDate.timestamp),
    end: new Date(eventDate.timestamp + eventDate.duration),
    title: event.name,
    color: EventColorsUtils.getColor(eventCalendarType)
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
