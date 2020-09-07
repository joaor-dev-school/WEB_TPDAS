import { DateModel } from '../../models/date.model';
import { EventPeriodicityModel } from './event-periodicity.model';
import { EventSubmitModel } from './event-submit.model';

export interface InviteSubmitModel extends EventSubmitModel {
  date: DateModel;
  periodicity: EventPeriodicityModel;
}
