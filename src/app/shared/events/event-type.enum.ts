export enum EventTypeEnum {
  SCHEDULING_COLLABORATIVE = 'SCHEDULING_COLLABORATIVE',
  INVITE = 'INVITE',
  SCHEDULING_AUTOMATIC = 'SCHEDULING_AUTOMATIC'
}

export const eventTypesList: () => EventTypeEnum[] = (): EventTypeEnum[] => [
  EventTypeEnum.INVITE,
  EventTypeEnum.SCHEDULING_COLLABORATIVE,
  EventTypeEnum.SCHEDULING_AUTOMATIC
];
