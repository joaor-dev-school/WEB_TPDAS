import { EventStatusChangesModel } from './event-status-changes.model';

export interface EventCollaborativeStatusChangesModel extends EventStatusChangesModel {
  preferredTimestamps: number[];
  acceptableTimestamps: number[];
}
