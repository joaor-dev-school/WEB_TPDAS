import { DateModel } from '../../models/date.model';
import { EventTypeEnum } from '../event-type.enum';
import { EventParticipantModel } from './event-participant.model';

export interface EventListItemModel {
  eventId: number;
  creator: number;
  participants: EventParticipantModel[];
  name: string;
  type: EventTypeEnum;
  dates: DateModel[];
}
