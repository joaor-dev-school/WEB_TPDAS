import { EventParticipantStateEnum } from '../event-participant-state.enum';

export interface EventStatusChangesModel {
  userId: number;
  status: EventParticipantStateEnum;
}
