// Khai báo tool cho Claude. Đây là hợp đồng giữa model và app: model chỉ được
// gọi đúng những tool ở đây, còn việc THỰC THI nằm ở phía app (xem src/services).
//
// Anthropic dùng khoá `input_schema` (Gemini dùng `parameters`) — đổi tên thôi,
// nội dung JSON Schema bên trong giống hệt.
//
// Nguyên tắc an toàn của app tài chính: mọi tool đều CHỈ ĐỌC. Không có tool nào
// chuyển tiền. Việc duy nhất có tác dụng phụ là `openScreen`, và nó cũng chỉ mở
// màn kèm dữ liệu điền sẵn — người dùng vẫn phải tự bấm xác nhận.

export const TOOL_DECLARATIONS = [
  {
    name: 'getBalance',
    description: 'Lấy số dư khả dụng hiện tại của tài khoản, đơn vị VND.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'listTransactions',
    description:
      'Lấy lịch sử giao dịch ngân hàng gần đây. Dùng khi người dùng hỏi về tiền vào, tiền ra, hoặc một giao dịch cụ thể.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['income', 'expense'],
          description: 'Lọc theo tiền vào hoặc tiền ra. Bỏ trống để lấy tất cả.',
        },
      },
    },
  },
  {
    name: 'spendingByCategory',
    description:
      'Tổng chi tiêu theo từng danh mục (ăn uống, mua sắm, tiện ích, giải trí, di chuyển), sắp giảm dần. Dùng khi người dùng hỏi tiêu nhiều nhất vào việc gì.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'listExpenses',
    description: 'Danh sách các khoản chi tiêu, có thể lọc theo danh mục.',
    input_schema: {
      type: 'object',
      properties: {
        categoryId: {
          type: 'string',
          enum: ['food', 'shopping', 'fun', 'transport', 'utility', 'other'],
          description: 'Mã danh mục cần lọc. Bỏ trống để lấy tất cả.',
        },
      },
    },
  },
  {
    name: 'totalSpent',
    description: 'Tổng số tiền đã chi trong kỳ, đơn vị VND.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'searchContacts',
    description:
      'Tìm người nhận trong danh bạ theo tên hoặc tên ngân hàng. Dùng trước khi mở màn chuyển tiền để lấy đúng người.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Tên hoặc tên ngân hàng cần tìm.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'getRates',
    description: 'Tỷ giá USD/VND, EUR/VND và giá vàng mỗi gram, lấy trực tiếp từ nguồn.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'openScreen',
    description:
      'Mở một màn hình trong app, có thể điền sẵn dữ liệu. KHÔNG thực hiện giao dịch — người dùng vẫn phải tự bấm xác nhận. Chỉ gọi khi người dùng yêu cầu rõ ràng muốn đi tới màn đó.',
    input_schema: {
      type: 'object',
      properties: {
        screen: {
          type: 'string',
          enum: ['TransferMoney', 'QRPay', 'TopUp', 'CardManagement', 'ExpenseScreen', 'InvestmentScreen', 'BankScreen'],
          description: 'Tên màn hình cần mở.',
        },
        contactName: {
          type: 'string',
          description: 'Chỉ dùng với TransferMoney: tên người nhận để điền sẵn.',
        },
        amount: {
          type: 'number',
          description: 'Chỉ dùng với TransferMoney hoặc TopUp: số tiền để điền sẵn, đơn vị VND.',
        },
      },
      required: ['screen'],
    },
  },
];

// Chặn model bịa tên hàm: chỉ chuyển tiếp lời gọi nằm trong danh sách trên.
const ALLOWED = new Set(TOOL_DECLARATIONS.map(d => d.name));
export const isAllowedTool = name => ALLOWED.has(name);
