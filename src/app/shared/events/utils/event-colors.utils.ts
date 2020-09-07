import { EventColor } from 'calendar-utils';
import { EventCalendarTypeEnum } from '../event-calendar-type.enum';

export class EventColorsUtils {
  private static instance: EventColorsUtils;
  private eventColors: Map<EventCalendarTypeEnum, EventColor>;

  private constructor() {
    this.eventColors = new Map();
    this.fillEventColorsData();
  }

  static getColor(type: EventCalendarTypeEnum, numberOfEvents: number = 0): EventColor {
    const thisInstance: EventColorsUtils = this.instance || new EventColorsUtils();
    const color: EventColor = thisInstance.eventColors.get(type);
    if (type === EventCalendarTypeEnum.SCHEDULING_COLLABORATIVE && numberOfEvents > 1) {
      return { primary: color.secondary, secondary: '#ffffff' };
    }
    return color;
  }

  private fillEventColorsData(): void {
    this.eventColors.set(EventCalendarTypeEnum.INVITE_SIMPLE,
      { primary: '#ad2121', secondary: '#FAE3E3' });
    this.eventColors.set(EventCalendarTypeEnum.INVITE_PERIODIC,
      { primary: '#1e90ff', secondary: '#D1E8FF' });
    this.eventColors.set(EventCalendarTypeEnum.SCHEDULING_COLLABORATIVE,
      { primary: '#3effAA', secondary: '#D1FFE8' });
    this.eventColors.set(EventCalendarTypeEnum.SCHEDULING_AUTOMATIC,
      { primary: '#e3bc08', secondary: '#FDF1BA' });
  }

}
