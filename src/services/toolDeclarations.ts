/* eslint-disable quotes, comma-dangle -- tệp máy sinh bởi tools/gen-tool-declarations.mjs */
// TỆP ĐƯỢC SINH TỰ ĐỘNG — đừng sửa tay.
// Nguồn: server/src/tools.js
// Sinh lại: node tools/gen-tool-declarations.mjs

/** Khai báo tool theo chuẩn Anthropic. Provider Gemini tự đổi sang dạng của nó. */
export type ToolDeclaration = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

export const TOOL_DECLARATIONS: ToolDeclaration[] = [
  {
    "name": "getBalance",
    "description": "Lấy số dư khả dụng hiện tại của tài khoản, đơn vị VND.",
    "input_schema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "listTransactions",
    "description": "Lấy lịch sử giao dịch ngân hàng gần đây. Dùng khi người dùng hỏi về tiền vào, tiền ra, hoặc một giao dịch cụ thể.",
    "input_schema": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "income",
            "expense"
          ],
          "description": "Lọc theo tiền vào hoặc tiền ra. Bỏ trống để lấy tất cả."
        }
      }
    }
  },
  {
    "name": "spendingByCategory",
    "description": "Tổng chi tiêu theo từng danh mục (ăn uống, mua sắm, tiện ích, giải trí, di chuyển), sắp giảm dần. Dùng khi người dùng hỏi tiêu nhiều nhất vào việc gì.",
    "input_schema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "listExpenses",
    "description": "Danh sách các khoản chi tiêu, có thể lọc theo danh mục.",
    "input_schema": {
      "type": "object",
      "properties": {
        "categoryId": {
          "type": "string",
          "enum": [
            "food",
            "shopping",
            "fun",
            "transport",
            "utility",
            "other"
          ],
          "description": "Mã danh mục cần lọc. Bỏ trống để lấy tất cả."
        }
      }
    }
  },
  {
    "name": "totalSpent",
    "description": "Tổng số tiền đã chi trong kỳ, đơn vị VND.",
    "input_schema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "searchContacts",
    "description": "Tìm người nhận trong danh bạ theo tên hoặc tên ngân hàng. Dùng trước khi mở màn chuyển tiền để lấy đúng người.",
    "input_schema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Tên hoặc tên ngân hàng cần tìm."
        }
      },
      "required": [
        "query"
      ]
    }
  },
  {
    "name": "getRates",
    "description": "Tỷ giá USD/VND, EUR/VND và giá vàng mỗi gram, lấy trực tiếp từ nguồn.",
    "input_schema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "openScreen",
    "description": "Mở một màn hình trong app, có thể điền sẵn dữ liệu. KHÔNG thực hiện giao dịch — người dùng vẫn phải tự bấm xác nhận. Chỉ gọi khi người dùng yêu cầu rõ ràng muốn đi tới màn đó.",
    "input_schema": {
      "type": "object",
      "properties": {
        "screen": {
          "type": "string",
          "enum": [
            "TransferMoney",
            "QRPay",
            "TopUp",
            "CardManagement",
            "ExpenseScreen",
            "InvestmentScreen",
            "BankScreen"
          ],
          "description": "Tên màn hình cần mở."
        },
        "contactName": {
          "type": "string",
          "description": "Chỉ dùng với TransferMoney: tên người nhận để điền sẵn."
        },
        "amount": {
          "type": "number",
          "description": "Chỉ dùng với TransferMoney hoặc TopUp: số tiền để điền sẵn, đơn vị VND."
        }
      },
      "required": [
        "screen"
      ]
    }
  }
];

const ALLOWED = new Set(TOOL_DECLARATIONS.map(d => d.name));
export const isAllowedTool = (name: string): boolean => ALLOWED.has(name);
