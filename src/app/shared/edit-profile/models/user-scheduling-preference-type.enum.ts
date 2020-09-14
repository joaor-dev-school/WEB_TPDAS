export enum UserSchedulingPreferenceTypeEnum {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
  WEEKEND = 'WEEKEND',
}

export const userSchedulingPreferenceTypes: () => UserSchedulingPreferenceTypeEnum[] = (): UserSchedulingPreferenceTypeEnum[] => [
  UserSchedulingPreferenceTypeEnum.DAY,
  UserSchedulingPreferenceTypeEnum.WEEK,
  UserSchedulingPreferenceTypeEnum.WEEKEND,
  UserSchedulingPreferenceTypeEnum.MONTH,
  UserSchedulingPreferenceTypeEnum.YEAR
];
