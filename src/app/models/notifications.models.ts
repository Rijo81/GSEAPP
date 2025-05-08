export namespace ModelsNotifications {
  export interface NotificationI {
    id?: string;
    title: string;
    message: string;
    user_id?: string;
    is_read: boolean;
    created_at: string;
  }
}

