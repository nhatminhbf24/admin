import React, { useState } from 'react';
import {
  QrCode,
  X,
  Copy,
  Check,
  CheckCircle2,
  Building2,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Download,
  Share2
} from 'lucide-react';
import { Order, PaymentStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  DEFAULT_BANK_CONFIG,
  SUPPORTED_BANKS,
  generateVietQrUrl,
  formatPaymentContent,
  BankAccountConfig,
} from '../utils/vietQrHelper';

interface VietQrModalProps {
  order?: Order | null;
  customAmount?: number;
  customOrderCode?: string;
  customCustomerName?: string;
  onClose: () => void;
  onConfirmPaymentSuccess?: (orderId: string, newPaymentStatus: PaymentStatus, note?: string) => void;
}

export const VietQrModal: React.FC<VietQrModalProps> = ({
  order,
  customAmount,
  customOrderCode,
  customCustomerName,
  onClose,
  onConfirmPaymentSuccess,
}) => {
  const [bankConfig, setBankConfig] = useState<BankAccountConfig>(DEFAULT_BANK_CONFIG);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const orderCode = order?.orderCode || customOrderCode || 'GIFT-ORDER';
  const customerName = order?.customerName || customCustomerName || 'Khach Hang';
  const totalAmount = order?.totalAmount || customAmount || 0;
  const depositAmount = order?.depositAmount || Math.round(totalAmount * 0.5);
  const remainingAmount = Math.max(0, totalAmount - (order?.depositAmount || 0));

  // Mode: cọc 50%, tất toán toàn bộ, hoặc thanh toán phần còn lại
  const [paymentMode, setPaymentMode] = useState<'coc' | 'remaining' | 'full'>(
    order?.paymentStatus === 'da_coc_50' ? 'remaining' : 'coc'
  );

  const amountToPay =
    paymentMode === 'coc'
      ? Math.round(totalAmount * 0.5)
      : paymentMode === 'remaining'
      ? remainingAmount
      : totalAmount;

  const transferContent = formatPaymentContent(
    orderCode,
    customerName,
    paymentMode === 'coc' ? 'coc' : 'full'
  );

  const qrImageUrl = generateVietQrUrl(amountToPay, transferContent, bankConfig, 'compact');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPaid = () => {
    if (order && onConfirmPaymentSuccess) {
      const newStatus: PaymentStatus =
        paymentMode === 'coc' && order.paymentStatus === 'chua_coc'
          ? 'da_coc_50'
          : 'da_tat_toan';
      onConfirmPaymentSuccess(order.id, newStatus, `Đối soát VietQR: +${formatCurrency(amountToPay)}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Mã Thanh Toán VietQR Chuẩn Napas247</h3>
              <p className="text-[11px] text-blue-100">Quét mã bằng mọi ứng dụng Mobile Banking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Payment Mode Selector */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setPaymentMode('coc')}
              className={`py-2 px-1 text-center font-bold rounded-xl transition-all ${
                paymentMode === 'coc'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Đặt Cọc 50%
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                {formatCurrency(Math.round(totalAmount * 0.5))}
              </span>
            </button>

            <button
              onClick={() => setPaymentMode('remaining')}
              className={`py-2 px-1 text-center font-bold rounded-xl transition-all ${
                paymentMode === 'remaining'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Phần Còn Lại
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                {formatCurrency(remainingAmount)}
              </span>
            </button>

            <button
              onClick={() => setPaymentMode('full')}
              className={`py-2 px-1 text-center font-bold rounded-xl transition-all ${
                paymentMode === 'full'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Tất Toán 100%
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                {formatCurrency(totalAmount)}
              </span>
            </button>
          </div>

          {/* QR Code Canvas Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 max-w-[260px] w-full flex flex-col items-center">
              <img
                src={qrImageUrl}
                alt="VietQR Payment Code"
                className="w-full h-auto object-contain rounded-xl"
                loading="lazy"
              />
              <div className="w-full mt-2 pt-2 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Napas 247 • Chuyển Nhanh</p>
                <p className="text-sm font-black text-blue-700">{formatCurrency(amountToPay)}</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 text-center">
              Mở App Ngân hàng bất kỳ (Vietcombank, MB, Techcombank, Momo...) để quét mã tự điền số tiền & nội dung.
            </p>
          </div>

          {/* Bank details with 1-click copy */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Ngân hàng:</span>
              <span className="font-bold text-slate-900 dark:text-white">{bankConfig.bankName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Số tài khoản:</span>
              <button
                onClick={() => copyToClipboard(bankConfig.accountNo, 'stk')}
                className="flex items-center gap-1.5 font-mono font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                <span>{bankConfig.accountNo}</span>
                {copiedField === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Chủ tài khoản:</span>
              <span className="font-bold text-slate-900 dark:text-white uppercase">{bankConfig.accountName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Số tiền:</span>
              <button
                onClick={() => copyToClipboard(amountToPay.toString(), 'amount')}
                className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 hover:text-emerald-700"
              >
                <span>{formatCurrency(amountToPay)}</span>
                {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Nội dung CK:</span>
              <button
                onClick={() => copyToClipboard(transferContent, 'content')}
                className="flex items-center gap-1.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md"
              >
                <span>{transferContent}</span>
                {copiedField === 'content' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action buttons: Reconciliation confirmation */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
            >
              Đóng
            </button>

            {order && onConfirmPaymentSuccess && (
              <button
                onClick={handleConfirmPaid}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Xác Nhận Đã Nhận Tiền
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
