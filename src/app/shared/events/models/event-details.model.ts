import { DateModel } from '../../models/date.model';
import { EventTypeEnum } from '../event-type.enum';
import { EventParticipantModel } from './event-participant.model';
import { EventPeriodicityModel } from './event-periodicity.model';

export interface EventDetailsModel {
  eventId: number;
  name: string;
  type: EventTypeEnum;
  dates: DateModel[];
  creator: EventParticipantModel;
  participants: EventParticipantModel[];
  periodicity: EventPeriodicityModel;
}

export function emptyEventDetails(): EventDetailsModel {
  return {
    eventId: null,
    name: '',
    type: EventTypeEnum.INVITE,
    creator: null,
    participants: [],
    dates: [{ timestamp: new Date().getTime(), duration: 360_000 }],
    periodicity: null
  };
}
