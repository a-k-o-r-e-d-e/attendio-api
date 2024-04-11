export type BaseNotificationData = {
  message: string;
};

export type ClassStartedNotificationData = {
    message: string,
    class_instance_id: string
}
export type NotificationData = BaseNotificationData | ClassStartedNotificationData 