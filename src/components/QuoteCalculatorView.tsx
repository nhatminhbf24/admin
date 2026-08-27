import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Gift,
  Printer,
  Sparkles,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  PlusCircle,
  TrendingDown,
  Info,
  DollarSign,
  Package,
  Zap,
  Flame,
  Sun
} from 'lucide-react';
import { GiftProduct, PrintTechnique } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO } from '../data/mockData';

interface QuoteCalculatorViewProps {
  products: GiftProduct[];
  onCreateOrderFromQuote: (quoteData: any) => void;
}

export const QuoteCalculatorView: React.FC<QuoteCalculatorViewProps> = ({
  products,
  onCreateOrderFromQuote,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(100);
  const [technique, setTechnique] = useState<PrintTechnique>('uv');
  const [positionsCount, setPositionsCount] = useState<number>(1);
  const [personalizeCount, setPersonalizeCount] = useState<number>(0);
  const [packaging, setPackaging] = useState<'khong_hop' | 'hop_carton' | 'hop_xi_lot_lua' | 'tui_kraft'>('hop_xi_lot_lua');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [includeVAT, setIncludeVAT] = useState<boolean>(true);
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(0);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Base pricing logic for printing industry in Vietnam
  const calculation = useMemo(() => {
    if (!selectedProduct) return null;

    const baseUnitCost = selectedProduct.basePrice;

    // Print cost per unit based on technique and quantity tier
    let unitPrintCost = 0;
    let setupFee = 0; // Phí chế bản / ra phim / tạo file khuôn

    switch (technique) {
      case 'laser':
        unitPrintCost = quantity >= 500 ? 5000 : quantity >= 100 ? 8000 : quantity >= 50 ? 12000 : 18000;
        setupFee = quantity < 50 ? 100000 : 0;
        break;
      case 'uv':
        unitPrintCost = quantity >= 500 ? 10000 : quantity >= 100 ? 15000 : quantity >= 50 ? 22000 : 30000;
        setupFee = quantity < 100 ? 150000 : 0;
        break;
      case 'chuyen_nhiet':
        unitPrintCost = quantity >= 500 ? 7000 : quantity >= 100 ? 10000 : quantity >= 50 ? 14000 : 20000;
        setupFee = quantity < 50 ? 80000 : 0;
        break;
      case 'in_luoi':
        unitPrintCost = quantity >= 500 ? 3500 : quantity >= 100 ? 6000 : quantity >= 50 ? 10000 : 15000;
        setupFee = 250000; // Phí chụp khung lụa
        break;
      case 'dtf':
        unitPrintCost = quantity >= 500 ? 12000 : quantity >= 100 ? 18000 : quantity >= 50 ? 25000 : 35000;
        setupFee = 0;
        break;
      case 'ep_kim':
        unitPrintCost = quantity >= 500 ? 6000 : quantity >= 100 ? 9000 : quantity >= 50 ? 14000 : 22000;
        setupFee = 350000; // Tiền khắc khuôn đồng ép nhũ
        break;
      default:
        unitPrintCost = 12000;
        setupFee = 100000;
    }

    // Multiply for additional positions
    const extraPositionCost = positionsCount > 1 ? (positionsCount - 1) * (unitPrintCost * 0.7) : 0;
    const totalUnitPrint = unitPrintCost + extraPositionCost;

    // Personalization cost (khắc tên riêng từng chiếc)
    const personalizeFee = personalizeCount * 10000;

    // Packaging cost per unit
    let packagingUnitCost = 0;
    if (packaging === 'hop_carton') packagingUnitCost = 5000;
    if (packaging === 'hop_xi_lot_lua') packagingUnitCost = 25000;
    if (packaging === 'tui_kraft') packagingUnitCost = 6000;

    // Quantity Discount Tier
    let quantityDiscountRate = 0;
    if (quantity >= 1000) quantityDiscountRate = 0.20;
    else if (quantity >= 500) quantityDiscountRate = 0.15;
    else if (quantity >= 200) quantityDiscountRate = 0.10;
    else if (quantity >= 100) quantityDiscountRate = 0.05;

    // Subtotal calculations
    const totalBlanks = baseUnitCost * quantity;
    const totalPrintWork = totalUnitPrint * quantity + setupFee + personalizeFee;
    const totalPackaging = packagingUnitCost * quantity;

    const rawSubtotal = totalBlanks + totalPrintWork + totalPackaging;

    // Discounts
    const volumeDiscountAmount = rawSubtotal * quantityDiscountRate;
    const customDiscountAmount = (rawSubtotal - volumeDiscountAmount) * (customDiscountPercent / 100);
    const totalDiscount = volumeDiscountAmount + customDiscountAmount;

    // Urgent surcharge
    const urgentFee = isUrgent ? (rawSubtotal - totalDiscount) * 0.2 : 0;

    const subtotalAfterDiscount = rawSubtotal - totalDiscount + urgentFee;
    const vatAmount = includeVAT ? subtotalAfterDiscount * 0.08 : 0;
    const grandTotal = subtotalAfterDiscount + vatAmount;

    const finalUnitPrice = Math.round(grandTotal / quantity);

    return {
      baseUnitCost,
      unitPrintCost: totalUnitPrint,
      setupFee,
      personalizeFee,
      packagingUnitCost,
      totalBlanks,
      totalPrintWork,
      totalPackaging,
      rawSubtotal,
      quantityDiscountRate: quantityDiscountRate * 100,
      volumeDiscountAmount,
      customDiscountAmount,
      totalDiscount,
      urgentFee,
      subtotalAfterDiscount,
      vatAmount,
      grandTotal,
      finalUnitPrice,
    };
  }, [selectedProduct, quantity, technique, positionsCount, personalizeCount, packaging, isUrgent, includeVAT, customDiscountPercent]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" /> Máy Tính Báo Giá & Chiết Khấu In Quà Tặng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Barem tính giá chuẩn xưởng in ấn theo phôi quà, công nghệ in, số lượng bậc thang và phụ phí khuôn mẫu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Inputs & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Step 1: Chọn Phôi Quà Tặng */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4 text-blue-600" /> 1. Chọn Sản Phẩm / Phôi Quà Tặng
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedProductId(prod.id);
                    if (!prod.compatibleTechniques.includes(technique)) {
                      setTechnique(prod.compatibleTechniques[0] || 'uv');
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    selectedProductId === prod.id
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {prod.name}
                    </p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                      Giá phôi: {formatCurrency(prod.basePrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Số Lượng Đặt Hàng */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" /> 2. Số Lượng Đặt Hàng
              </label>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {quantity} chiếc
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex-1 accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-24 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center outline-none focus:border-blue-500"
              />
            </div>

            {/* Quick Quantity Buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[20, 50, 100, 200, 350, 500, 1000].map((qty) => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    quantity === qty
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {qty} chiếc
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Chọn Công Nghệ In & Vị Trí */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-600" /> 3. Công Nghệ In & Quy Cách
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(PRINT_TECHNIQUES_INFO) as PrintTechnique[]).map((techKey) => {
                const info = PRINT_TECHNIQUES_INFO[techKey];
                const isCompatible = selectedProduct?.compatibleTechniques.includes(techKey);
                const isSelected = technique === techKey;

                return (
                  <button
                    key={techKey}
                    disabled={!isCompatible}
                    onClick={() => setTechnique(techKey)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                        : isCompatible
                        ? 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : 'border-slate-100 dark:border-slate-800/40 opacity-40 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center justify-between">
                      {info.name}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {info.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Vị Trí In & Tùy Chọn Đóng Gói */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Số vị trí in trên sản phẩm:
              </label>
              <select
                value={positionsCount}
                onChange={(e) => setPositionsCount(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value={1}>1 Vị trí (Thân trước / Ngực trái)</option>
                <option value={2}>2 Vị trí (Thân trước + Nắp/Lưng)</option>
                <option value={3}>3 Vị trí (Thân + Nắp + Đáy)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Quy cách hộp & bao bì quà tặng:
              </label>
              <select
                value={packaging}
                onChange={(e) => setPackaging(e.target.value as any)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="khong_hop">Không hộp (Túi OPP có sẵn)</option>
                <option value="hop_carton">Hộp Carton sóng mộc (+5.000đ/c)</option>
                <option value="hop_xi_lot_lua">Hộp Xi Nam Châm Lót Lụa VIP (+25.000đ/c)</option>
                <option value="tui_kraft">Túi Giấy Kraft Xách Dây Dù (+6.000đ/c)</option>
              </select>
            </div>
          </div>

          {/* Step 5: Cá Nhân Hóa & Đơn Hỏa Tốc */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Khắc/In tên riêng từng chiếc (cá nhân hóa):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={quantity}
                  value={personalizeCount}
                  onChange={(e) => setPersonalizeCount(Math.min(quantity, Number(e.target.value)))}
                  placeholder="0 chiếc"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 shrink-0">+10k/chiếc</span>
              </div>
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  🔥 Lệnh In Hỏa Tốc Trong 24h (+20%)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVAT}
                  onChange={(e) => setIncludeVAT(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Xuất hóa đơn VAT 8% (Doanh nghiệp)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Panel: Live Quote Summary & Price Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {calculation && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/40 dark:border-blue-600/40 shadow-xl shadow-blue-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Bảng Báo Giá Trực Tiếp
              </div>

              <div className="mb-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  TỔNG CHI PHÍ DỰ TOÁN
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                    {formatCurrency(calculation.grandTotal)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  Đơn giá trọn gói: <span className="text-blue-600 font-bold">{formatCurrency(calculation.finalUnitPrice)}</span> / chiếc
                </p>
              </div>

              {/* Detailed Breakdown */}
              <div className="py-3 border-y border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tiền phôi quà tặng ({quantity} chiếc):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(calculation.totalBlanks)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Công in ấn ({PRINT_TECHNIQUES_INFO[technique].name}):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(calculation.unitPrintCost * quantity)}
                  </span>
                </div>

                {calculation.setupFee > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Phí chế bản / khuôn mẫu in:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(calculation.setupFee)}
                    </span>
                  </div>
                )}

                {calculation.personalizeFee > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Phí khắc tên cá nhân ({personalizeCount} tên):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(calculation.personalizeFee)}
                    </span>
                  </div>
                )}

                {calculation.totalPackaging > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Bao bì & hộp quà ({quantity} chiếc):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(calculation.totalPackaging)}
                    </span>
                  </div>
                )}

                {calculation.volumeDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> Chiết khấu số lượng ({calculation.quantityDiscountRate}%):
                    </span>
                    <span>- {formatCurrency(calculation.volumeDiscountAmount)}</span>
                  </div>
                )}

                {calculation.urgentFee > 0 && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold">
                    <span>Phụ phí hỏa tốc 24h:</span>
                    <span>+ {formatCurrency(calculation.urgentFee)}</span>
                  </div>
                )}

                {includeVAT && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Thuế GTGT (VAT 8%):</span>
                    <span>{formatCurrency(calculation.vatAmount)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 space-y-2.5">
                <button
                  onClick={() => {
                    onCreateOrderFromQuote({
                      product: selectedProduct,
                      quantity,
                      technique,
                      positionsCount,
                      packaging,
                      personalizeCount,
                      isUrgent,
                      calculation,
                    });
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Chuyển Thành Đơn Hàng In Ngay
                </button>

                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" /> In / Tải Báo Giá PDF Gửi Khách
                </button>
              </div>

              {/* Tips */}
              <div className="mt-4 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Báo giá có hiệu lực trong 15 ngày. Đã bao gồm đóng gói kiểm định QC 100% trước khi xuất xưởng.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
