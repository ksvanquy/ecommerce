/**
 * Tiện ích định dạng tiền tệ và số theo chuẩn Việt Nam Đồng (VNĐ)
 */

/**
 * Định dạng số tiền sang chuẩn Việt Nam Đồng (VNĐ).
 * Ví dụ: 8490000 -> "8.490.000 VNĐ"
 *
 * @param amount - Giá trị số tiền cần định dạng
 * @param unit - Đơn vị hiển thị (mặc định 'VNĐ')
 * @returns Chuỗi tiền tệ đã được định dạng
 */
export function formatCurrency(amount: number | null | undefined, unit: 'VNĐ' | '₫' = 'VNĐ'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0 ${unit}`;
  }
  return `${amount.toLocaleString('vi-VN')} ${unit}`;
}

/**
 * Rút gọn đơn vị tiền tệ VNĐ (tiện dùng)
 */
export function formatVND(amount: number | null | undefined): string {
  return formatCurrency(amount, 'VNĐ');
}

/**
 * Định dạng số lượng hoặc số thông thường theo chuẩn vi-VN
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString('vi-VN');
}
