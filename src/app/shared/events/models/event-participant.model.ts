import { EventParticipantStateEnum } from '../event-participant-state.enum';

export interface EventParticipantModel {
  participantId: number;
  name: string;
  state: EventParticipantStateEnum;
}
