// Sinh src/services/toolDeclarations.ts từ server/src/tools.js.
//
// Hai bên phải khớp nhau: Worker dùng bản của nó khi chat đi qua proxy, app dùng
// bản này khi gọi model thẳng. Lệch nhau thì model được mời gọi một hàm mà đầu
// kia không biết chạy.
//
//   node tools/gen-tool-declarations.mjs          # sinh lại
//   node tools/gen-tool-declarations.mjs --check  # chỉ báo lệch, không ghi

import { readFileSync, writeFileSync } from 'node:fs';
import { TOOL_DECLARATIONS } from '../server/src/tools.js';

const OUT = 'src/services/toolDeclarations.ts';

const body = `/* eslint-disable quotes, comma-dangle -- tệp máy sinh bởi tools/gen-tool-declarations.mjs */
// TỆP ĐƯỢC SINH TỰ ĐỘNG — đừng sửa tay.
// Nguồn: server/src/tools.js
// Sinh lại: node tools/gen-tool-declarations.mjs

/** Khai báo tool theo chuẩn Anthropic. Provider Gemini tự đổi sang dạng của nó. */
export type ToolDeclaration = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

export const TOOL_DECLARATIONS: ToolDeclaration[] = ${JSON.stringify(TOOL_DECLARATIONS, null, 2)};

const ALLOWED = new Set(TOOL_DECLARATIONS.map(d => d.name));
export const isAllowedTool = (name: string): boolean => ALLOWED.has(name);
`;

if (process.argv.includes('--check')) {
  const current = readFileSync(OUT, 'utf8');
  if (current !== body) {
    console.error(`LỆCH: ${OUT} không khớp server/src/tools.js`);
    console.error('Chạy: node tools/gen-tool-declarations.mjs');
    process.exit(1);
  }
  console.log(`khớp: ${TOOL_DECLARATIONS.length} tool`);
} else {
  writeFileSync(OUT, body);
  console.log(`đã sinh ${OUT} — ${TOOL_DECLARATIONS.length} tool`);
}
