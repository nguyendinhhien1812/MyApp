import { Translations } from '../i18n/translations';

// Nội dung thông báo nằm trong translations; ở đây chỉ giữ khoá và trạng thái.
export type NotifKey = keyof Translations['notification']['items'];

export type NotifTime =
  | { value: number; unit: 'minutes' | 'hours' | 'days' }
  | { value: 0; unit: 'yesterday' };

export type Notification = {
  id: number;
  key: NotifKey;
  isRead: boolean;
  time: NotifTime;
};

const NOTIFICATIONS: Notification[] = [
  { id: 1, key: 'transferOut',  isRead: false, time: { value: 5, unit: 'minutes' } },
  { id: 2, key: 'receiveMoney', isRead: false, time: { value: 32, unit: 'minutes' } },
  { id: 3, key: 'security',     isRead: false, time: { value: 2, unit: 'hours' } },
  { id: 4, key: 'salary',       isRead: true,  time: { value: 0, unit: 'yesterday' } },
  { id: 5, key: 'spotify',      isRead: true,  time: { value: 0, unit: 'yesterday' } },
  { id: 6, key: 'promo',        isRead: true,  time: { value: 2, unit: 'days' } },
];

export const listNotifications = (): Notification[] => [...NOTIFICATIONS];

export const unreadCount = (items: Notification[] = NOTIFICATIONS): number =>
  items.filter(n => !n.isRead).length;
