// Kiểm cú pháp của đoạn <script> BÊN TRONG trang admin.
//
// `node --check adminPage.js` không đủ: trang nằm trong một template literal, nên
// module vẫn hợp lệ trong khi JS phát ra cho trình duyệt đã hỏng. Đã dính thật:
// viết '\n' trong chuỗi -> template literal biến thành xuống dòng THẬT -> chuỗi
// nháy đơn trong trang bị vỡ, cả trang chết câm, không nút nào chạy.
import { ADMIN_HTML } from '../src/adminPage.js';

const mo = ADMIN_HTML.indexOf('<script>');
const dong = ADMIN_HTML.lastIndexOf('</script>');
if (mo < 0 || dong < 0) {
  console.error('không tìm thấy khối <script> trong trang admin');
  process.exit(1);
}

const js = ADMIN_HTML.slice(mo + '<script>'.length, dong);
try {
  new Function(js);
} catch (err) {
  console.error('script trong trang admin sai cú pháp:', err.message);
  process.exit(1);
}
console.log(`OK script trang admin (${js.length} ký tự)`);
