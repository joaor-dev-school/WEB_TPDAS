import { DateModel } from '../../models/date.model';
import { EventTypeEnum } from '../event-type.enum';
import { EventSubmitModel } from './event-submit.model';

export interface SchedulingSubmitModel extends EventSubmitModel {
  dates: DateModel[];
  type: EventTypeEnum;
}
