// Entry rỗng có chủ đích.
//
// React Native CLI bắt buộc phải có --entry-file, nhưng mini-app không có điểm
// khởi động riêng: nó được host nạp qua Module Federation. Trỏ vào index.js của
// host thì cả app chính bị gói vào bundle remote (đã thử: 11.9 MB thay vì ~12 KB).
//
// Container do ModuleFederationPlugin sinh ra, không phụ thuộc file này.
export {};
