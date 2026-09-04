// Thực thi lời gọi hàm mà model yêu cầu. Chạy ở CLIENT: model không đọc được
// dữ liệu, nó chỉ nói "tôi cần getBalance()" rồi app tự lấy và gửi kết quả lại.
//
// AN TOÀN: mọi hàm ở đây chỉ ĐỌC. Không có hàm nào chuyển tiền. `openScreen`
// chỉ trả về ý định điều hướng — màn hình quyết định có mở hay không, và dù mở
// thì cũng chỉ điền sẵn dữ liệu, người dùng vẫn phải tự bấm xác nhận.

import { logger } from '../utils/logger';
import * as account from './accountService';
import * as expense from './expenseService';
import * as contact from './contactService';
import * as investment from './investmentService';

export type NavIntent = {
  screen: string;
  contactName?: string;
  amount?: number;
};

export type ToolResult = {
  // Dữ liệu gửi ngược lên model
  data: unknown;
  // Ý định điều hướng, nếu model gọi openScreen
  nav?: NavIntent;
};

const num = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

export const runTool = async (
  name: string,
  args: Record<string, unknown> = {},
): Promise<ToolResult> => {
  switch (name) {
    case 'getBalance':
      return { data: { balance: account.getBalance(), currency: 'VND' } };

    case 'listTransactions': {
      const type = str(args.type);
      return {
        data: account.listTransactions(
          type === 'income' || type === 'expense' ? { type } : undefined,
        ),
      };
    }

    case 'spendingByCategory':
      return { data: expense.spendingByCategory() };

    case 'listExpenses': {
      const categoryId = str(args.categoryId) as expense.CategoryId | undefined;
      return { data: expense.listExpenses(categoryId ? { categoryId } : undefined) };
    }

    case 'totalSpent':
      return { data: { total: expense.totalSpent(), currency: 'VND' } };

    case 'searchContacts':
      return { data: contact.searchContacts(str(args.query) ?? '') };

    case 'getRates':
      // Hàm mạng duy nhất — lỗi để cho phía gọi bắt và báo lại cho model
      return { data: await investment.fetchRates() };

    case 'openScreen': {
      const screen = str(args.screen);
      if (!screen) {
        return { data: { ok: false, reason: 'thiếu tên màn hình' } };
      }
      const nav: NavIntent = {
        screen,
        contactName: str(args.contactName),
        amount: num(args.amount),
      };
      // Nói rõ với model rằng đây mới là mở màn, chưa làm gì cả — tránh việc
      // nó tường thuật lại thành "đã chuyển tiền xong".
      return {
        data: { ok: true, opened: screen, note: 'Đã mở màn hình và điền sẵn. Chưa thực hiện giao dịch.' },
        nav,
      };
    }

    default:
      logger.warn('chatbot', `model gọi hàm không hỗ trợ: ${name}`);
      return { data: { ok: false, reason: `không có hàm tên ${name}` } };
  }
};
