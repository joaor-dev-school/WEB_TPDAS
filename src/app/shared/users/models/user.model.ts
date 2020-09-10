import { NotificationItemModel } from '../../notifications/models/notification-item.model';

export interface UserModel {
  id: number;
  name: string;
  username: string;
  notifications: NotificationItemModel[];
}
