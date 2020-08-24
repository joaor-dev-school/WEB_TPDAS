import { DateModel } from '../../models/date.model';
import { EventTypeEnum } from '../event-type.enum';

export interface EventListItemModel {
  eventId: number;
  creator: number;
  name: string;
  type: EventTypeEnum;
  dates: DateModel[];
}
