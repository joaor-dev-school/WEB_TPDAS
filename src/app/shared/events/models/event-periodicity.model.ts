import { EventPeriodicityRuleModel } from './event-periodicity-rule.model';

export interface EventPeriodicityModel {
  rules: EventPeriodicityRuleModel[];
  rangeTimestamp: number;
}
