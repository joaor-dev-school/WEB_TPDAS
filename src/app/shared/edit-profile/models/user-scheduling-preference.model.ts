import { UserSchedulingPreferenceTypeEnum } from './user-scheduling-preference-type.enum';

export interface UserSchedulingPreferenceModel {
  fromTimestamp: number;
  toTimestamp: number;
  type: UserSchedulingPreferenceTypeEnum;
}
