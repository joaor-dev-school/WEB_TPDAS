import { DateModel } from '../../models/date.model';
import { EventCreateModel } from './event-create.model';
import { EventPeriodicityModel } from './event-periodicity.model';

export interface EventCreateInviteModel extends EventCreateModel {
  date: DateModel;
  periodicity?: EventPeriodicityModel;
}
