export interface NotificationItemModel {
  id: number;
  eventId: number;
  name: string;
  creatorName: string;
  nextDateTimestamp: number;
  totalParticipants: number;
  read: boolean;
}
