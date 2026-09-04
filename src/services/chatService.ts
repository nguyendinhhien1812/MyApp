// Lưu lịch sử hội thoại của trợ lý AI. Trước đây hội thoại chỉ nằm trong state
// nên tắt app là mất sạch.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const STORAGE_KEY = '@myapp/chat-history';

// Chặn lịch sử phình vô hạn. Chỉ ảnh hưởng phần LƯU — số lượt gửi lên model
// vẫn do phía gọi API tự cắt.
const MAX_STORED = 60;

export type ChatRole = 'user' | 'bot' | 'error';

export type StoredMessage = {
  id: string;
  text: string;
  role: ChatRole;
};

const isValid = (m: any): m is StoredMessage =>
  typeof m?.id === 'string' &&
  typeof m?.text === 'string' &&
  (m.role === 'user' || m.role === 'bot' || m.role === 'error');

/** Trả về mảng rỗng nếu chưa có gì hoặc dữ liệu hỏng — không ném lỗi. */
export const loadHistory = async (): Promise<StoredMessage[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) { return []; }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) { return []; }
    // Lọc từng phần tử: dữ liệu cũ có thể khác cấu trúc sau khi đổi code
    return parsed.filter(isValid);
  } catch (err) {
    logger.warn('chatbot', 'không đọc được lịch sử chat, bắt đầu hội thoại mới', err);
    return [];
  }
};

export const saveHistory = async (messages: StoredMessage[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
  } catch (err) {
    // Lưu hỏng thì hội thoại vẫn dùng được trong phiên, chỉ không nhớ lần sau
    logger.warn('chatbot', 'không lưu được lịch sử chat', err);
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    logger.warn('chatbot', 'không xoá được lịch sử chat', err);
  }
};

// ─── API key người dùng tự nhập ─────────────────────────────────────────────
//
// Trước đây key chỉ nằm trong một biến module nên mở lại app là mất, phải dán
// lại mỗi lần. Lưu xuống đây để dán một lần là xong.
//
// Lưu ý: AsyncStorage là chữ thường, nằm trong sandbox của app. Không phải chỗ
// cất bí mật cấp cao — nhưng cả hướng "app tự giữ key" vốn đã chấp nhận điều đó
// rồi; muốn key an toàn thật thì phải quay lại đi qua proxy.
const API_KEY_STORAGE = '@myapp/ai-api-key';

export const loadApiKey = async (): Promise<string> => {
  try {
    return (await AsyncStorage.getItem(API_KEY_STORAGE)) ?? '';
  } catch (err) {
    logger.warn('chatbot', 'không đọc được api key đã lưu', err);
    return '';
  }
};

export const saveApiKey = async (key: string): Promise<void> => {
  try {
    if (key) {
      await AsyncStorage.setItem(API_KEY_STORAGE, key);
    } else {
      await AsyncStorage.removeItem(API_KEY_STORAGE);
    }
  } catch (err) {
    // Không lưu được thì key vẫn dùng được cho phiên này
    logger.warn('chatbot', 'không lưu được api key', err);
  }
};
