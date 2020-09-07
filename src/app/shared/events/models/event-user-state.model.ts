import { DateModel } from '../../models/date.model';
import { EventParticipantStateEnum } from '../event-participant-state.enum';
import { EventTypeEnum } from '../event-type.enum';

export interface EventUserStateModel {
  eventId: number;
  eventName: string;
  eventDates: DateModel[];
  eventType: EventTypeEnum;
  userId: number;
  userState: EventParticipantStateEnum;
}
