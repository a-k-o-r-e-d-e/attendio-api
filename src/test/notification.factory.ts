import { NotificationType, Role } from "../constants/enums";
import { Notification } from "../notifications/entities/notification.entity";
import { buildUserMock } from "./user.factory";

export function buildNotificationMock(partial?: Partial<Notification>): Notification {
  return {
    id: '123e4567-e89b-12d3-a456-426614174001', // Mock student UUID
    type: NotificationType.ClassStarted,
    title: 'Notification Title',
    body: 'Notification Body',
    isRead: false,
    data: { key: 'value' },
    ...partial,
    user: {
      ...buildUserMock(partial?.user),
      roles: [Role.Student],
    },
  };
}
