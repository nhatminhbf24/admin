import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Gift,
  Printer,
  Calendar,
  Building2,
  Phone,
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Order, GiftProduct, PrintTechnique, PriorityLevel, PaymentStatus } from '../types';
import { PRINT_TECHNIQUES_INFO } from '../data/mockData';

interface NewOrderModalProps {
  products: GiftProduct[];
  onClose: () => void;
  onSaveOrder: (newOrder: Order) => void;
  initialQuoteData?: any;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  products,
  onClose,
  onSaveOrder,
  initialQuoteData,
}) => {
  const [customerName, setCustomerName] = useState(initialQuoteData?.customerName || '');
  const [customerCompany, setCustomerCompany] = useState(initialQuoteData?.customerCompany || '');
  const [customerPhone, setCustomerPhone] = useState(initialQuoteData?.customerPhone || '');
  const [shippingAddress, setShippingAddress] = useState(initialQuoteData?.shippingAddress || '');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<PriorityLevel>(initialQuoteData?.isUrgent ? 'hoa_toc' : 'binh_thuong');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('da_coc_50');

  // Product item selection
  const [selectedProdId, setSelectedProdId] = useState<string>(initialQuoteData?.product?.id || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(initialQuoteData?.quantity || 100);
  const [technique, setTechnique] = useState<PrintTechnique>(initialQuoteData?.technique || 'uv');
  const [printDimensions, setPrintDimensions] = useState('40 x 70 mm');
  const [printColors, setPrintColors] = useState('In UV 4 màu + phủ bóng');
  const [notes, setNotes] = useState('');

  const selectedProd = products.find((p) => p.id === selectedProdId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedProd) return;

    const unitPrint = technique === 'laser' ? 8000 : technique === 'uv' ? 18000 : 12000;
    const total = (selectedProd.basePrice + unitPrint) * quantity;
    const deposit = paymentStatus === 'da_tat_toan' ? total : paymentStatus === 'da_coc_50' ? Math.round(total * 0.5) : 0;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderCode: `GIFT-2608-${Math.floor(10 + Math.random() * 90)}`,
      customerName,
      customerCompany: customerCompany || undefined,
      customerPhone,
      customerEmail: '',
      status: 'tiep_nhan',
      priority,
      paymentStatus,
      totalAmount: total,
      depositAmount: deposit,
      createdAt: new Date().toISOString(),
      deadline: `${deadline}T17:00:00Z`,
      shippingAddress: shippingAddress || 'Nhận trực tiếp tại xưởng in',
      productionNotes: notes || 'Kiểm tra kỹ vị trí in và test mẫu 1 chiếc trước khi chạy hàng loạt.',
      items: [
        {
          id: `item-${Date.now()}`,
          productName: selectedProd.name,
          sku: selectedProd.sku,
          quantity,
          unitPrice: selectedProd.basePrice,
          printPricePerUnit: unitPrint,
          printPositions: [
            {
              id: `pos-${Date.now()}`,
              name: 'Vị trí chính (Mặt trước)',
              dimensions: printDimensions,
              colors: printColors,
              technique,
            },
          ],
          mockupUrl: selectedProd.imageUrl,
          proofApproved: false,
          notes: notes,
        },
      ],
    };

    onSaveOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Tiếp Nhận Đơn Hàng In Quà Tặng Mới
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Customer Info */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              1. Thông Tin Khách Hàng:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tên người đặt *:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Anh Minh"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tên công ty / Tổ chức:</label>
                <input
                  type="text"
                  placeholder="VD: Công ty Cổ phần Alpha"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Số điện thoại *:</label>
                <input
                  type="tel"
                  required
                  placeholder="0912 345 678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Hạn giao hàng xưởng *:</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Product & Print specs */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              2. Phôi Quà Tặng & Quy Cách In:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Chọn phôi sản phẩm:</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Số lượng (chiếc):</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Công nghệ in:</label>
                <select
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                >
                  {(Object.keys(PRINT_TECHNIQUES_INFO) as PrintTechnique[]).map((t) => (
                    <option key={t} value={t}>
                      {PRINT_TECHNIQUES_INFO[t].name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Kích thước vùng in:</label>
                <input
                  type="text"
                  value={printDimensions}
                  onChange={(e) => setPrintDimensions(e.target.value)}
                  placeholder="40 x 70 mm"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Priority & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Mức độ ưu tiên xưởng:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 font-semibold"
              >
                <option value="binh_thuong">Bình thường (3-5 ngày)</option>
                <option value="gap">⚡ Đơn Gấp (48h)</option>
                <option value="hoa_toc">🔥 Hỏa tốc (24h)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Trạng thái thanh toán:</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
              >
                <option value="da_coc_50">Đã đặt cọc 50%</option>
                <option value="da_tat_toan">Đã thanh toán 100%</option>
                <option value="chua_coc">Chưa cọc (Chờ duyệt)</option>
                <option value="cong_no">Công nợ B2B</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Ghi chú sản xuất xưởng:</label>
            <input
              type="text"
              placeholder="Yêu cầu kiểm tra màu Pantone, ép nhũ mặt trước..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
            >
              Tạo Lệnh Sản Xuất In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
