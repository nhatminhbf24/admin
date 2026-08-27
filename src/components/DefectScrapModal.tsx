import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Flame,
  Crosshair,
  Droplet,
  FileX,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { GiftProduct, Order, DefectLog, DefectReason } from '../types';
import { DEFECT_REASONS_INFO } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

interface DefectScrapModalProps {
  order?: Order | null;
  orders: Order[];
  products: GiftProduct[];
  preselectedProductSku?: string;
  onClose: () => void;
  onSubmitDefect: (defectData: {
    orderId?: string;
    orderCode?: string;
    productId: string;
    productName: string;
    sku: string;
    quantityScrapped: number;
    reason: DefectReason;
    customReasonNote?: string;
    technicianName: string;
    estimatedCostLoss: number;
    deductConsumables: boolean;
  }) => void;
}

export const DefectScrapModal: React.FC<DefectScrapModalProps> = ({
  order,
  orders,
  products,
  preselectedProductSku,
  onClose,
  onSubmitDefect,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(order?.id || '');
  
  // Find initial product
  const defaultProduct = preselectedProductSku 
    ? products.find(p => p.sku === preselectedProductSku)
    : order?.items[0]
    ? products.find(p => p.sku === order.items[0].sku) || products[0]
    : products[0];

  const [selectedProductId, setSelectedProductId] = useState<string>(defaultProduct?.id || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<DefectReason>('chay_mau_nhiet');
  const [customReasonNote, setCustomReasonNote] = useState<string>('');
  const [technicianName, setTechnicianName] = useState<string>(
    order?.assignedTechnician || 'Trần Hải Đăng (Kỹ thuật Ép Nhiệt)'
  );
  const [deductConsumables, setDeductConsumables] = useState<boolean>(true);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const targetOrder = orders.find(o => o.id === selectedOrderId) || order;

  const estimatedLoss = (selectedProduct?.basePrice || 0) * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    onSubmitDefect({
      orderId: targetOrder?.id,
      orderCode: targetOrder?.orderCode,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      quantityScrapped: quantity,
      reason,
      customReasonNote: customReasonNote.trim() || undefined,
      technicianName,
      estimatedCostLoss: estimatedLoss,
      deductConsumables,
    });

    onClose();
  };

  const getReasonIcon = (r: DefectReason) => {
    switch (r) {
      case 'chay_mau_nhiet':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'lech_tam_khuon':
        return <Crosshair className="w-4 h-4 text-indigo-500" />;
      case 'vo_nut_phoi':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'lem_muc_bot_khi':
        return <Droplet className="w-4 h-4 text-cyan-500" />;
      case 'loi_file_khach':
        return <FileX className="w-4 h-4 text-purple-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-rose-100 dark:border-rose-950/50 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Báo In Lại / Ghi Nhận Hỏng Phôi
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Tự động trừ 1 phôi kho • Không tăng tiền khách
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Reassurance Banner */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed">
              <strong>Chính sách chất lượng xưởng:</strong> Khi xảy ra sự cố cháy màu, nứt vỡ hoặc lệch tâm, hệ thống sẽ tự động xuất thêm phôi thay thế và ghi nhận chi phí hao hụt nội bộ. 
              Tổng tiền thanh toán của khách <strong>được giữ nguyên 100%</strong>.
            </p>
          </div>

          {/* Associated Order */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Đơn Hàng Xưởng Đang In
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500 font-medium"
            >
              <option value="">-- Ghi nhận sự cố ngoài đơn (Test máy / Hỏng phôi tự do) --</option>
              {orders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  {ord.orderCode} - {ord.customerName} ({ord.items[0]?.productName || 'Sản phẩm'})
                </option>
              ))}
            </select>
          </div>

          {/* Blank Item / Product */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Chủng Loại Phôi Bị Hỏng Cần Xuất Bù <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500 font-bold"
              required
            >
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  [{prod.sku}] {prod.name} (Tồn hiện tại: {prod.stockQuantity} {prod.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Technician */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số Lượng Phôi Hỏng (Cái) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stockQuantity || 100}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-rose-500 text-center text-sm"
                  required
                />
                <span className="text-slate-500 font-medium">{selectedProduct?.unit || 'Chiếc'}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kỹ Thuật Viên Phụ Trách
              </label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500"
              >
                <option value="Trần Hải Đăng (Kỹ thuật Ép Nhiệt)">Trần Hải Đăng (Ép Nhiệt)</option>
                <option value="Nguyễn Văn Tuấn (Kỹ thuật In Ảnh)">Nguyễn Văn Tuấn (In Ảnh / Decal)</option>
                <option value="Lê Hoàng Nam (Chế bản & Cắt Bế)">Lê Hoàng Nam (Cắt Bế / Đóng Gói)</option>
                <option value="Thợ Ca Trực Khác">Thợ Ca Trực Khác</option>
              </select>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nguyên Nhân Gây Hỏng Phôi <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(DEFECT_REASONS_INFO) as DefectReason[]).map((rKey) => {
                const info = DEFECT_REASONS_INFO[rKey];
                const isSelected = reason === rKey;
                return (
                  <button
                    type="button"
                    key={rKey}
                    onClick={() => setReason(rKey)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getReasonIcon(rKey)}</div>
                    <div>
                      <p className="font-bold text-[11px]">{info.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{info.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Note */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ghi Chú Chi Tiết Sự Cố (Để Rút Kinh Nghiệm Ca Sau)
            </label>
            <textarea
              rows={2}
              value={customReasonNote}
              onChange={(e) => setCustomReasonNote(e.target.value)}
              placeholder="VD: Nhiệt độ khuôn ép bị vọt lên 210°C, hoặc lực ép máy quá mạnh làm nứt quai..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500 resize-none text-xs"
            />
          </div>

          {/* Consumable deduction checkbox */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-semibold text-xs">
              <input
                type="checkbox"
                checked={deductConsumables}
                onChange={(e) => setDeductConsumables(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Tự động trừ thêm Giấy in & Mực in hao phí (BOM)</span>
            </label>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              Ước tính hao hụt: {formatCurrency(estimatedLoss)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm shadow-rose-600/30 flex items-center gap-1.5 transition-all"
            >
              <AlertTriangle className="w-4 h-4" /> Xác Nhận Trừ Kho & Báo In Lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
