import { EventPeriodicityDaysTypeEnum } from '../event-periodicity-days-type.enum';

export interface EventPeriodicityRuleModel {
  days?: number[];
  daysNot?: number[];
  daysType: EventPeriodicityDaysTypeEnum;
  step: number;
}

export function emptyEventPeriodicityRule(): EventPeriodicityRuleModel {
  return { days: [null], daysNot: [], daysType: null, step: null };
}
