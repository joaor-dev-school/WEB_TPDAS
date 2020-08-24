import { DateModel } from '../../models/date.model';
import { EventPeriodicityModel } from './event-periodicity.model';

export interface EventSubmitModel {
  eventName: string;
  creatorId: number;
  participantsIds: number[];
  date: DateModel;
  periodicity: EventPeriodicityModel;
}
