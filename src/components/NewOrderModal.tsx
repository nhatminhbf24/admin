import React, { useState, useId } from 'react';
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
  AlertTriangle,
  Flame,
  Camera,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';
import { Order, GiftProduct, PrintTechnique, PriorityLevel, PaymentStatus, PrintServiceGroup } from '../types';
import { PRINT_TECHNIQUES_INFO, PRODUCT_CATEGORIES_INFO } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

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
  // Mode: Nhập nhanh (Quick Mode) hoặc Nâng cao (Advanced)
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [showBatchNamesModal, setShowBatchNamesModal] = useState(false);

  // Core essential fields (Chỉ 4 trường cần thiết nhất)
  const [customerName, setCustomerName] = useState(initialQuoteData?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialQuoteData?.customerPhone || '');
  const [selectedProdId, setSelectedProdId] = useState<string>(initialQuoteData?.product?.id || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(initialQuoteData?.quantity || (products[0]?.serviceGroup === 'in_anh_thuong' ? 30 : 50));
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Optional fields (Có giá trị mặc định hợp lý)
  const [customerCompany, setCustomerCompany] = useState(initialQuoteData?.customerCompany || '');
  const [shippingAddress, setShippingAddress] = useState(initialQuoteData?.shippingAddress || 'Nhận trực tiếp tại xưởng in');
  const [priority, setPriority] = useState<PriorityLevel>(initialQuoteData?.isUrgent ? 'hoa_toc' : 'binh_thuong');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('da_coc_50');
  const [technique, setTechnique] = useState<PrintTechnique>(initialQuoteData?.technique || 'chuyen_nhiet');
  const [shippingFeeCollected, setShippingFeeCollected] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Batch names input (Danh sách tên học sinh / thành viên)
  const [batchNamesRaw, setBatchNamesRaw] = useState('');
  const [customNamesList, setCustomNamesList] = useState<string[]>([]);

  const selectedProd = products.find((p) => p.id === selectedProdId) || products[0];

  // Parse batch names from raw text
  const handleApplyBatchNames = () => {
    const lines = batchNamesRaw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      setCustomNamesList(lines);
      setQuantity(lines.length);
      setNotes((prev) =>
        prev
          ? `${prev} | Có danh sách ${lines.length} tên riêng`
          : `In danh sách ${lines.length} tên riêng từng chiếc`
      );
    }
    setShowBatchNamesModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedProd) return;

    let unitPrint = 12000;
    if (initialQuoteData?.calculation?.unitPrintCost) {
      unitPrint = initialQuoteData.calculation.unitPrintCost;
    } else {
      if (selectedProd.serviceGroup === 'chuyen_nhiet') {
        unitPrint = quantity >= 100 ? 9000 : 15000;
      } else {
        unitPrint = selectedProd.category === 'in_nhan_vo' ? 15000 : 3000;
      }
    }

    const total = initialQuoteData?.grandTotal || initialQuoteData?.calculation?.grandTotal || (selectedProd.basePrice + unitPrint) * quantity;
    const deposit = paymentStatus === 'da_tat_toan' ? total : paymentStatus === 'da_coc_50' ? Math.round(total * 0.5) : 0;

    const multiQuoteItems = initialQuoteData?.multiItems;
    const orderItems = multiQuoteItems && multiQuoteItems.length > 0
      ? multiQuoteItems.map((qItem: any, idx: number) => {
          const prod = products.find((p) => p.id === qItem.productId) || selectedProd;
          return {
            id: `item-${Date.now()}-${idx}`,
            productName: qItem.productName || prod.name,
            sku: qItem.sku || prod.sku,
            category: qItem.category || prod.category,
            serviceGroup: qItem.serviceGroup || prod.serviceGroup,
            quantity: qItem.quantity,
            unitPrice: qItem.basePrice || prod.basePrice,
            printPricePerUnit: qItem.unitPrintCost || 12000,
            heatPressSpecs: prod.heatPressSpecs,
            photoPrintSpecs: prod.photoPrintSpecs,
            printPositions: [
              {
                id: `pos-${Date.now()}-${idx}`,
                name: qItem.descriptionSummary || 'Vị trí in tiêu chuẩn',
                dimensions: 'Khổ in tiêu chuẩn theo phôi',
                colors: 'In 4-6 màu sắc nét',
                technique: qItem.technique || 'chuyen_nhiet',
              },
            ],
            mockupUrl: qItem.imageUrl || prod.imageUrl,
            proofApproved: false,
            notes: qItem.descriptionSummary || '',
          };
        })
      : [
          {
            id: `item-${Date.now()}`,
            productName: selectedProd.name,
            sku: selectedProd.sku,
            category: selectedProd.category,
            serviceGroup: selectedProd.serviceGroup,
            quantity,
            unitPrice: selectedProd.basePrice,
            printPricePerUnit: unitPrint,
            heatPressSpecs: selectedProd.heatPressSpecs,
            photoPrintSpecs: selectedProd.photoPrintSpecs,
            printPositions: [
              {
                id: `pos-${Date.now()}`,
                name: 'Vị trí chính (Mặt trước)',
                dimensions: 'Khổ in tiêu chuẩn theo phôi',
                colors: 'In 4-6 màu sắc nét',
                technique,
              },
            ],
            mockupUrl: selectedProd.imageUrl,
            proofApproved: false,
            notes: notes,
            customNames: customNamesList.length > 0 ? customNamesList : undefined,
          },
        ];

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderCode: `GIFT-2608-${Math.floor(10 + Math.random() * 90)}`,
      customerName,
      customerCompany: customerCompany || undefined,
      customerPhone,
      customerEmail: '',
      serviceGroup: selectedProd.serviceGroup,
      status: 'dang_thiet_ke',
      priority,
      paymentStatus,
      totalAmount: total + (shippingFeeCollected || 0),
      depositAmount: deposit,
      shippingFeeCollected: shippingFeeCollected > 0 ? shippingFeeCollected : undefined,
      createdAt: new Date().toISOString(),
      deadline: `${deadline}T17:00:00Z`,
      shippingAddress: shippingAddress || 'Nhận trực tiếp tại xưởng in',
      productionNotes: notes || (selectedProd.serviceGroup === 'chuyen_nhiet' 
        ? 'Ép nhiệt đúng nhiệt độ và thời gian theo phiếu xưởng.' 
        : 'In ảnh sắc nét, cán màng bảo vệ, cắt bế cẩn thận.'),
      items: orderItems,
    };

    onSaveOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tạo Đơn Hàng Siêu Tốc (Xưởng In)
              </h3>
              <p className="text-[11px] text-slate-500">Chỉ cần 4 thông tin cơ bản để chốt đơn ngay lập tức</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Essential 4 Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên Khách Hàng / Zalo <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                required
                placeholder="VD: Cô Thu Hương / Anh Minh"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200 font-semibold focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số Điện Thoại / Zalo <span className="text-rose-500">*</span>:
              </label>
              <input
                type="tel"
                required
                placeholder="VD: 0983.456.789"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200 font-semibold focus:border-blue-500"
              />
            </div>
          </div>

          {/* Product selection */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sản phẩm / Phôi in quà tặng:
            </label>
            <select
              value={selectedProdId}
              onChange={(e) => {
                setSelectedProdId(e.target.value);
                const p = products.find((x) => x.id === e.target.value);
                if (p) {
                  setTechnique(p.compatibleTechniques[0] || (p.serviceGroup === 'chuyen_nhiet' ? 'chuyen_nhiet' : 'in_anh_lab'));
                }
              }}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-200 font-bold focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.serviceGroup === 'chuyen_nhiet' ? '🔥 Chuyển Nhiệt' : '📸 In Ảnh'}] {p.name} ({formatCurrency(p.basePrice)})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Số lượng đặt ({selectedProd?.unit || 'Chiếc'}):
                </label>
                <button
                  type="button"
                  onClick={() => setShowBatchNamesModal(true)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Paste Danh Sách Tên ({customNamesList.length})
                </button>
              </div>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-white font-black text-sm focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hạn xuất xưởng:
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200 focus:border-blue-500 font-semibold"
              />
            </div>
          </div>

          {/* Collapsible Advanced Info (Optional fields) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAdvanced(!isAdvanced)}
              className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold"
            >
              {isAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isAdvanced ? 'Thu gọn tùy chọn nâng cao' : '+ Thêm tùy chọn nâng cao (Cọc tiền, địa chỉ, đơn vị)'}
            </button>

            {isAdvanced && (
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Đơn vị / Trường học / Lớp:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Lớp 5A2 Tiểu học Nghĩa Đô"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Địa chỉ nhận hàng:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Nhận tại xưởng hoặc địa chỉ giao"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Mức ưu tiên tiến độ:
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                    >
                      <option value="binh_thuong">Bình thường (3-5 ngày)</option>
                      <option value="gap">Gấp (24-48 giờ)</option>
                      <option value="hoa_toc">⚡ Hỏa Tốc (Trong 24 giờ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Trạng thái thanh toán ban đầu:
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                    >
                      <option value="da_coc_50">Đã đặt cọc 50%</option>
                      <option value="da_tat_toan">Đã tất toán 100%</option>
                      <option value="chua_coc">Chưa cọc (Chờ duyệt)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span>Thu tiền Ship của khách:</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Lưu: Ship</span>
                    </label>
                    <input
                      type="number"
                      placeholder="VD: 35000 (0 nếu freeship)"
                      value={shippingFeeCollected || ''}
                      onChange={(e) => setShippingFeeCollected(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Ghi chú kỹ thuật xưởng:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Cán màng Hologram 7 màu, ép cốc quai tim..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-300" /> Bấm Lệnh Sản Xuất Ngay
            </button>
          </div>
        </form>
      </div>

      {/* Batch Names Input Sub-Modal */}
      {showBatchNamesModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Paste Danh Sách Tên Học Sinh / Khách Riêng
                </h4>
              </div>
              <button
                onClick={() => setShowBatchNamesModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Copy cột họ tên từ file Excel hoặc tin nhắn Zalo và dán vào ô dưới đây (mỗi dòng là 1 tên riêng):
            </p>

            <textarea
              rows={8}
              value={batchNamesRaw}
              onChange={(e) => setBatchNamesRaw(e.target.value)}
              placeholder={`1. Nguyễn Bảo An - Lớp 5A\n2. Trần Minh Khang - Lớp 5A\n3. Lê Ngọc Diệp - Lớp 5A\n...`}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Đã nhận diện:{' '}
                <strong className="text-blue-600">
                  {batchNamesRaw.split('\n').filter((l) => l.trim().length > 0).length} tên
                </strong>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchNamesModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleApplyBatchNames}
                  className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Áp Dụng Vào Đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
