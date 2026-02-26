export interface Notification {
    id: number;
    userId: number;
    eventId?: number;
    message: string;
    isRead: boolean;
    createdAt: string;
}
