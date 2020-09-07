import { EventUserStateViewDateModel } from './event-user-state-view-date.model';
import { EventUserStateModel } from './event-user-state.model';

export interface EventUserStateViewModel extends EventUserStateModel {
  eventDatesView: EventUserStateViewDateModel[];
}
