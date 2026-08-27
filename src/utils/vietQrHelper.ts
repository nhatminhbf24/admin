export interface BankAccountConfig {
  bankId: string; // VD: 'MB', 'VCB', 'TCB', 'VPB', 'ACB', 'BIDV', 'ICB'
  bankName: string;
  accountNo: string;
  accountName: string;
}

export const DEFAULT_BANK_CONFIG: BankAccountConfig = {
  bankId: 'BIDV',
  bankName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
  accountNo: '8894820733',
  accountName: 'TRAN THI THANH DUNG',
};

export const SUPPORTED_BANKS = [
  { id: 'MB', name: 'MB Bank (Quân Đội)', short: 'MB' },
  { id: 'VCB', name: 'Vietcombank', short: 'VCB' },
  { id: 'TCB', name: 'Techcombank', short: 'TCB' },
  { id: 'VPB', name: 'VPBank', short: 'VPB' },
  { id: 'ACB', name: 'ACB', short: 'ACB' },
  { id: 'ICB', name: 'VietinBank', short: 'ICB' },
  { id: 'BIDV', name: 'BIDV', short: 'BIDV' },
  { id: 'TPB', name: 'TPBank', short: 'TPB' },
];

/**
 * Sinh URL ảnh VietQR chuẩn Napas 247
 * @param amount Số tiền (VND)
 * @param description Nội dung chuyển khoản
 * @param config Cấu hình tài khoản ngân hàng xưởng
 */
export function generateVietQrUrl(
  amount: number,
  description: string,
  config: BankAccountConfig = DEFAULT_BANK_CONFIG,
  template: 'compact' | 'qr_only' | 'print' = 'compact'
): string {
  const safeAmount = Math.max(0, Math.round(amount));
  const safeDesc = description.substring(0, 50).trim();
  const encodedDesc = encodeURIComponent(safeDesc);
  const encodedName = encodeURIComponent(config.accountName);

  return `https://img.vietqr.io/image/${config.bankId}-${config.accountNo}-${template}.png?amount=${safeAmount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}

/**
 * Tạo nội dung cú pháp chuyển khoản gọn đẹp
 */
export function formatPaymentContent(orderCode: string, customerName?: string, type: 'coc' | 'full' = 'coc'): string {
  const cleanCode = orderCode.replace(/[^a-zA-Z0-9]/g, '');
  const cleanName = customerName ? customerName.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(' ').slice(-1)[0] : '';
  
  if (type === 'coc') {
    return `${cleanCode} ${cleanName} COC`.trim();
  }
  return `${cleanCode} ${cleanName} TT`.trim();
}
