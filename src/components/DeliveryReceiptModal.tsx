import React, { useState } from 'react';
import {
  Printer,
  X,
  QrCode,
  Sparkles,
  Settings2,
  Check,
  Phone,
  MapPin,
  FileCheck,
  Layers,
  Palette,
  Truck,
  RotateCcw
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrency, formatNumber, formatDate, numberToVietnameseWords } from '../utils/formatters';
import { generateVietQrUrl, formatPaymentContent, DEFAULT_BANK_CONFIG } from '../utils/vietQrHelper';

export type PaperSize = 'A6' | 'A7' | 'K80' | 'A5';

export interface ShopInfo {
  shopName: string;
  address: string;
  zaloPhone: string;
  receiptTitle: string;
  footerNote: string;
}

const DEFAULT_SHOP_INFO: ShopInfo = {
  shopName: 'DÂU DÂU SHOP',
  address: '93/41 Nguyễn Ái Quốc, Tân Phong, Đồng Nai',
  zaloPhone: 'Zalo 079.840.8406',
  receiptTitle: 'HÓA ĐƠN BÁN HÀNG',
  footerNote: 'Cảm ơn quý khách đã tin tưởng và ủng hộ!',
};

const COLOR_THEMES = [
  { id: 'rose', name: 'Hồng Dâu (Như mẫu)', primary: '#e11d48', bgLight: '#fff1f2', border: '#fecdd3', textAccent: '#be123c' },
  { id: 'blue', name: 'Xanh Chuyên Nghiệp', primary: '#2563eb', bgLight: '#eff6ff', border: '#bfdbfe', textAccent: '#1d4ed8' },
  { id: 'emerald', name: 'Xanh Lá Tươi Sáng', primary: '#059669', bgLight: '#ecfdf5', border: '#a7f3d0', textAccent: '#047857' },
  { id: 'amber', name: 'Cam Nổi Bật', primary: '#d97706', bgLight: '#fffbeb', border: '#fde68a', textAccent: '#b45309' },
  { id: 'dark', name: 'Đen Trắng (In Nhiệt)', primary: '#0f172a', bgLight: '#f8fafc', border: '#e2e8f0', textAccent: '#0f172a' },
];

interface DeliveryReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  initialPaperSize?: PaperSize;
  initialReceiptTitle?: string;
  modalTitle?: string;
  initialShippingFee?: number;
}

export const DeliveryReceiptModal: React.FC<DeliveryReceiptModalProps> = ({
  order,
  onClose,
  initialPaperSize = 'A6',
  initialReceiptTitle,
  modalTitle,
  initialShippingFee,
}) => {
  if (!order) return null;

  const [paperSize, setPaperSize] = useState<PaperSize>(initialPaperSize);
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [includeVietQr, setIncludeVietQr] = useState(true);

  // Editable parameters for flexible printing
  const [shopInfo, setShopInfo] = useState<ShopInfo>({
    ...DEFAULT_SHOP_INFO,
    receiptTitle: initialReceiptTitle || DEFAULT_SHOP_INFO.receiptTitle,
  });
  const [shippingFee, setShippingFee] = useState<number>(
    initialShippingFee !== undefined ? initialShippingFee : (order.shippingFeeCollected || 0)
  );
  const [customDeposit, setCustomDeposit] = useState<number>(order.depositAmount || 0);

  // Financial calculations
  const totalGoodsAmount = order.totalAmount;
  const grandTotal = totalGoodsAmount + (Number(shippingFee) || 0);
  const remainingDue = Math.max(0, grandTotal - (Number(customDeposit) || 0));
  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Generate VietQR for remaining balance (or full total if deposit is 0)
  const qrTransferContent = formatPaymentContent(
    order.orderCode,
    order.customerName,
    remainingDue < grandTotal ? 'coc' : 'full'
  );
  const qrImageUrl = generateVietQrUrl(
    remainingDue > 0 ? remainingDue : grandTotal,
    qrTransferContent,
    DEFAULT_BANK_CONFIG,
    'compact'
  );

  const amountInWords = numberToVietnameseWords(grandTotal);

  // Size styling map for CSS preview & Print container
  const sizeStyles: Record<PaperSize, { containerWidth: string; fontSize: string; tablePadding: string; padding: string }> = {
    A6: {
      containerWidth: 'w-[400px]',
      fontSize: 'text-[11px]',
      tablePadding: 'py-1 px-1.5',
      padding: 'p-4',
    },
    A7: {
      containerWidth: 'w-[320px]',
      fontSize: 'text-[9.5px]',
      tablePadding: 'py-0.5 px-1',
      padding: 'p-3',
    },
    K80: {
      containerWidth: 'w-[360px]',
      fontSize: 'text-[10px]',
      tablePadding: 'py-0.5 px-1.5',
      padding: 'p-3',
    },
    A5: {
      containerWidth: 'w-[540px]',
      fontSize: 'text-xs',
      tablePadding: 'py-1.5 px-2.5',
      padding: 'p-6',
    },
  };

  const currentSizeStyle = sizeStyles[paperSize];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Outer Modal Container */}
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* TOP TOOLBAR (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/80 gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                {modalTitle ? `${modalTitle} Khổ ${paperSize}` : `Xuất Phiếu Giao Hàng / Hóa Đơn Khổ ${paperSize}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Đơn: <span className="text-rose-400 font-mono font-bold">{order.orderCode}</span> • {order.customerName}
              </p>
            </div>
          </div>

          {/* Controls: Size Tabs, Theme, Settings & Print Action */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Paper Size selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs">
              {(['A6', 'A7', 'K80', 'A5'] as PaperSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setPaperSize(sz)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    paperSize === sz
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Khổ {sz}
                </button>
              ))}
            </div>

            {/* Quick theme picker */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  title={theme.name}
                  style={{ backgroundColor: theme.primary }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    selectedTheme.id === theme.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            {/* Toggle Config Dropdown */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showSettings
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="Tùy chỉnh thông tin shop & phí"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-md shadow-rose-600/30"
            >
              <Printer className="w-4 h-4" /> In Phiếu Ngay
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SETTINGS PANEL (Shown if toggled) */}
        {showSettings && (
          <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300 shrink-0 print:hidden animate-in slide-in-from-top-2 duration-150">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Tên Cửa Hàng / Xưởng:</label>
              <input
                type="text"
                value={shopInfo.shopName}
                onChange={(e) => setShopInfo({ ...shopInfo, shopName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Địa Chỉ Shop:</label>
              <input
                type="text"
                value={shopInfo.address}
                onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Số Zalo / Hotline:</label>
              <input
                type="text"
                value={shopInfo.zaloPhone}
                onChange={(e) => setShopInfo({ ...shopInfo, zaloPhone: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Tiêu Đề Phiếu:</label>
              <input
                type="text"
                value={shopInfo.receiptTitle}
                onChange={(e) => setShopInfo({ ...shopInfo, receiptTitle: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Phí Vận Chuyển (VNĐ):</label>
              <input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-white outline-none focus:border-rose-500"
                step="5000"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Tiền Đã Cọc (VNĐ):</label>
              <input
                type="number"
                value={customDeposit}
                onChange={(e) => setCustomDeposit(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-white outline-none focus:border-rose-500"
                step="10000"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVietQr}
                  onChange={(e) => setIncludeVietQr(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-200">In mã VietQR chuyển khoản nhanh ở góc phiếu</span>
              </label>

              <button
                onClick={() => {
                  setShopInfo(DEFAULT_SHOP_INFO);
                  setShippingFee(0);
                  setCustomDeposit(order.depositAmount || 0);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Mặc định
              </button>
            </div>
          </div>
        )}

        {/* RECEIPT PREVIEW & PRINT CANVAS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/60 custom-scrollbar">
          
          {/* PRINTABLE RECEIPT CONTAINER */}
          <div
            id="printable-delivery-receipt"
            className={`bg-white text-slate-900 shadow-2xl rounded-2xl mx-auto font-sans leading-tight select-text transition-all ${currentSizeStyle.containerWidth} ${currentSizeStyle.fontSize} ${currentSizeStyle.padding}`}
            style={{
              fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {/* 1. Header: Store Info & Receipt Title */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h1
                  className="font-black text-sm uppercase tracking-tight"
                  style={{ color: selectedTheme.primary }}
                >
                  {shopInfo.shopName}
                </h1>
                <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{shopInfo.address}</p>
                <p className="text-[10px] text-slate-700 font-semibold mt-0.5">{shopInfo.zaloPhone}</p>
              </div>

              <div className="text-right shrink-0">
                <h2
                  className="font-black text-xs sm:text-sm uppercase tracking-tight"
                  style={{ color: selectedTheme.primary }}
                >
                  {shopInfo.receiptTitle}
                </h2>
                <p className="text-[10px] text-slate-700 mt-0.5">
                  <strong>Mã HĐ:</strong> <span className="font-mono font-bold">{order.orderCode}</span>
                </p>
                <p className="text-[10px] text-slate-600">
                  <strong>Ngày lập:</strong> {formatDate(order.createdAt || new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Accent divider line */}
            <div
              className="h-1 w-full rounded-full my-2.5"
              style={{ backgroundColor: selectedTheme.primary }}
            />

            {/* 2. Customer Information Box */}
            <div
              className="rounded-xl p-2.5 my-2 border-l-4 space-y-1"
              style={{
                backgroundColor: selectedTheme.bgLight,
                borderColor: selectedTheme.primary,
              }}
            >
              <p className="text-slate-800">
                <strong className="text-slate-900">Khách hàng:</strong> {order.customerCompany ? `${order.customerCompany} (${order.customerName})` : order.customerName}
              </p>
              <p className="text-slate-800">
                <strong className="text-slate-900">Số điện thoại:</strong> {order.customerPhone}
              </p>
              <p className="text-slate-800">
                <strong className="text-slate-900">Địa chỉ:</strong> {order.shippingAddress || 'Nhận tại xưởng in'}
              </p>
            </div>

            {/* 3. Items & Services Table */}
            <div className="my-2.5 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="text-white font-bold uppercase tracking-wider text-[10px]"
                    style={{ backgroundColor: selectedTheme.primary }}
                  >
                    <th className={`${currentSizeStyle.tablePadding} text-center w-7`}>STT</th>
                    <th className={`${currentSizeStyle.tablePadding}`}>Tên sản phẩm / Dịch vụ</th>
                    <th className={`${currentSizeStyle.tablePadding} text-center w-8`}>SL</th>
                    <th className={`${currentSizeStyle.tablePadding} text-right`}>Đơn giá</th>
                    <th className={`${currentSizeStyle.tablePadding} text-right`}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((it, idx) => {
                    const unitPrice = it.unitPrice + it.printPricePerUnit;
                    const lineTotal = unitPrice * it.quantity;
                    return (
                      <tr key={it.id || idx} className="hover:bg-slate-50/80">
                        <td className={`${currentSizeStyle.tablePadding} text-center text-slate-500 font-medium`}>
                          {idx + 1}
                        </td>
                        <td className={`${currentSizeStyle.tablePadding}`}>
                          <p className="font-semibold text-slate-900">{it.productName}</p>
                          {it.customNames && it.customNames.length > 0 && (
                            <p className="text-[9px] text-slate-500 italic">
                              In {it.customNames.length} tên riêng ({it.customNames.slice(0, 3).join(', ')}{it.customNames.length > 3 ? '...' : ''})
                            </p>
                          )}
                        </td>
                        <td className={`${currentSizeStyle.tablePadding} text-center font-bold text-slate-800`}>
                          {it.quantity}
                        </td>
                        <td className={`${currentSizeStyle.tablePadding} text-right font-mono text-slate-700`}>
                          {formatNumber(unitPrice)}
                        </td>
                        <td className={`${currentSizeStyle.tablePadding} text-right font-mono font-bold text-slate-900`}>
                          {formatNumber(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4. Quantity & Financial Summary */}
            <div className="flex justify-between items-start gap-2 pt-1">
              <div className="text-slate-700">
                <p className="font-bold">
                  Tổng số lượng: <span className="font-extrabold text-slate-900">{totalItemsCount}</span>
                </p>
                {order.customerNotes && (
                  <p className="text-[10px] text-slate-500 italic mt-1 max-w-[140px]">
                    Ghi chú: {order.customerNotes}
                  </p>
                )}
              </div>

              <div className="text-right space-y-1 min-w-[180px]">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-bold text-slate-900">{formatNumber(totalGoodsAmount)} VNĐ</span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span>Phí ship:</span>
                  <span className="font-medium text-slate-800">{formatNumber(shippingFee)} VNĐ</span>
                </div>

                {/* Dashed line */}
                <div
                  className="border-t border-dashed my-1"
                  style={{ borderColor: selectedTheme.primary }}
                />

                <div
                  className="flex justify-between items-center font-black"
                  style={{ color: selectedTheme.primary }}
                >
                  <span className="uppercase text-[10.5px]">TỔNG CỘNG:</span>
                  <span className="text-xs sm:text-sm">{formatNumber(grandTotal)} VNĐ</span>
                </div>

                {/* Dashed line */}
                <div
                  className="border-t border-dashed my-1"
                  style={{ borderColor: selectedTheme.primary }}
                />

                <div className="flex justify-between items-center text-slate-700">
                  <span>Đã cọc:</span>
                  <span className="font-medium text-slate-800">{formatNumber(customDeposit)} VNĐ</span>
                </div>

                <div
                  className="flex justify-between items-center font-bold text-[11px]"
                  style={{ color: selectedTheme.textAccent }}
                >
                  <span>Còn lại (Thu COD):</span>
                  <span className="text-xs font-black">{formatNumber(remainingDue)} VNĐ</span>
                </div>
              </div>
            </div>

            {/* 5. Amount in Words Box */}
            <div
              className="mt-2.5 p-2 rounded-xl border text-[10px]"
              style={{
                borderColor: selectedTheme.border,
                backgroundColor: selectedTheme.bgLight,
              }}
            >
              <p className="text-slate-800">
                <strong className="text-slate-900">Số tiền bằng chữ:</strong>{' '}
                <span className="italic font-medium">{amountInWords}</span>
              </p>
            </div>

            {/* 6. VietQR Code on Bill if enabled */}
            {includeVietQr && remainingDue > 0 && (
              <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src={qrImageUrl}
                    alt="VietQR Thanh Toán"
                    className="w-14 h-14 object-contain bg-white p-0.5 rounded-lg border border-slate-300 shrink-0"
                  />
                  <div className="text-[9.5px] text-slate-600">
                    <p className="font-bold text-slate-900 flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-rose-600" /> Quét VietQR Thanh Toán:
                    </p>
                    <p>Số tiền: <strong>{formatCurrency(remainingDue)}</strong></p>
                    <p className="text-[8.5px] text-slate-500">Nội dung: {qrTransferContent}</p>
                  </div>
                </div>
                <div className="text-right text-[9px] text-slate-500 shrink-0">
                  <p className="font-semibold text-emerald-700">Chuyển khoản 24/7</p>
                  <p>Không lo tiền lẻ</p>
                </div>
              </div>
            )}

            {/* 7. Signatures */}
            <div className="mt-4 pt-2 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-bold uppercase text-[10.5px] text-slate-900">NGƯỜI MUA HÀNG</p>
                <p className="text-[9px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-9 flex items-end justify-center">
                  <p className="font-bold text-[10.5px]" style={{ color: selectedTheme.primary }}>
                    {order.customerName}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-bold uppercase text-[10.5px] text-slate-900">NGƯỜI BÁN HÀNG</p>
                <p className="text-[9px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-9 flex items-end justify-center">
                  <p className="font-bold text-[10.5px]" style={{ color: selectedTheme.primary }}>
                    Xác nhận thanh toán
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Footer Gratitude */}
            <div className="mt-3 pt-2 text-center border-t border-slate-200">
              <p className="text-[10px] text-slate-500 italic font-medium">
                {shopInfo.footerNote}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT CSS STYLES INJECTED DYNAMICALLY */}
      <style>{`
        @media print {
          /* Hide everything outside the delivery receipt */
          body * {
            visibility: hidden !important;
          }
          #printable-delivery-receipt,
          #printable-delivery-receipt * {
            visibility: visible !important;
          }
          #printable-delivery-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: auto;
            margin: 3mm;
          }
        }
      `}</style>
    </div>
  );
};
