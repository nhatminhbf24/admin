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
  Sun,
  Camera,
  Tag,
  Maximize,
  Clock,
  Thermometer
} from 'lucide-react';
import { GiftProduct, PrintTechnique, PrintServiceGroup, ProductCategory } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO, PRINT_SERVICE_GROUPS, PRODUCT_CATEGORIES_INFO } from '../data/mockData';
import { VietQrModal } from './VietQrModal';
import { QrCode } from 'lucide-react';

interface QuoteCalculatorViewProps {
  products: GiftProduct[];
  onCreateOrderFromQuote: (quoteData: any) => void;
}

export const QuoteCalculatorView: React.FC<QuoteCalculatorViewProps> = ({
  products,
  onCreateOrderFromQuote,
}) => {
  // Service Group Filter Tab
  const [selectedGroup, setSelectedGroup] = useState<PrintServiceGroup>('chuyen_nhiet');

  // Filter products by selected service group
  const groupProducts = useMemo(() => {
    return products.filter((p) => p.serviceGroup === selectedGroup);
  }, [products, selectedGroup]);

  const [selectedProductId, setSelectedProductId] = useState<string>(groupProducts[0]?.id || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(100);
  const [technique, setTechnique] = useState<PrintTechnique>('chuyen_nhiet');
  const [positionsCount, setPositionsCount] = useState<number>(1);
  const [personalizeCount, setPersonalizeCount] = useState<number>(0);
  const [packaging, setPackaging] = useState<'khong_hop' | 'hop_carton' | 'hop_xi_lot_lua' | 'tui_kraft'>('hop_carton');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [includeVAT, setIncludeVAT] = useState<boolean>(false);

  // Photo Printing specifics
  const [selectedPhotoFormat, setSelectedPhotoFormat] = useState<string>('6x9 cm (Polaroid)');
  const [selectedLamination, setSelectedLamination] = useState<'khong_can' | 'can_bong' | 'can_mo' | 'can_hologram' | 'ep_plastic'>('can_hologram');
  const [selectedFrameOption, setSelectedFrameOption] = useState<'khong_khung' | 'khung_composite_de_ban' | 'khung_go_treo_tuong'>('khong_khung');
  const [showQrModal, setShowQrModal] = useState(false);

  // Update selected product when switching tab
  const handleSwitchGroup = (group: PrintServiceGroup) => {
    setSelectedGroup(group);
    const newGroupProds = products.filter((p) => p.serviceGroup === group);
    if (newGroupProds.length > 0) {
      setSelectedProductId(newGroupProds[0].id);
      setTechnique(newGroupProds[0].compatibleTechniques[0] || (group === 'chuyen_nhiet' ? 'chuyen_nhiet' : 'in_anh_lab'));
      if (group === 'in_anh_thuong') {
        setQuantity(30);
      } else {
        setQuantity(50);
      }
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || groupProducts[0] || products[0];

  // Pricing calculation logic for Sublimation vs Photo Printing
  const calculation = useMemo(() => {
    if (!selectedProduct) return null;

    let baseUnitCost = selectedProduct.basePrice;
    let unitPrintCost = 0;
    let setupFee = 0;

    if (selectedGroup === 'chuyen_nhiet') {
      // Sublimation specific calculations
      switch (selectedProduct.category) {
        case 'ly_su':
          unitPrintCost = quantity >= 500 ? 6000 : quantity >= 100 ? 9000 : quantity >= 30 ? 14000 : 25000;
          break;
        case 'moc_khoa':
          unitPrintCost = quantity >= 500 ? 3000 : quantity >= 100 ? 5000 : quantity >= 30 ? 8000 : 15000;
          break;
        case 'huy_hieu':
          unitPrintCost = quantity >= 500 ? 2500 : quantity >= 100 ? 4000 : quantity >= 30 ? 7000 : 12000;
          break;
        case 'dong_ho':
          unitPrintCost = quantity >= 500 ? 15000 : quantity >= 100 ? 25000 : quantity >= 10 ? 40000 : 60000;
          break;
        case 'ao_thun':
          unitPrintCost = quantity >= 500 ? 8000 : quantity >= 100 ? 12000 : quantity >= 20 ? 20000 : 35000;
          break;
        case 'binh_giu_nhiet':
          unitPrintCost = quantity >= 500 ? 10000 : quantity >= 100 ? 15000 : quantity >= 20 ? 25000 : 40000;
          break;
        case 'ky_niem_chuong':
          unitPrintCost = quantity >= 500 ? 20000 : quantity >= 100 ? 35000 : quantity >= 10 ? 50000 : 80000;
          break;
        case 'tranh_da':
          unitPrintCost = quantity >= 500 ? 25000 : quantity >= 100 ? 40000 : quantity >= 10 ? 65000 : 110000;
          break;
        case 'tranh_ghep':
          unitPrintCost = quantity >= 500 ? 6000 : quantity >= 100 ? 10000 : quantity >= 20 ? 18000 : 30000;
          break;
        case 'tui_vai':
          unitPrintCost = quantity >= 500 ? 6000 : quantity >= 100 ? 10000 : quantity >= 20 ? 16000 : 28000;
          break;
        case 'bop_but_3d':
          unitPrintCost = quantity >= 500 ? 8000 : quantity >= 100 ? 12000 : quantity >= 20 ? 20000 : 35000;
          break;
        default:
          unitPrintCost = 12000;
      }

      setupFee = quantity < 10 ? 30000 : 0;
    } else {
      // Photo / Decal Printing specific calculations
      if (selectedProduct.category === 'in_nhan_vo') {
        // Nhãn vở bán theo set
        baseUnitCost = 12000; // Giá phôi decal
        unitPrintCost = quantity >= 100 ? 10000 : quantity >= 30 ? 16000 : 25000; // Tiền in + bế demi
      } else if (selectedProduct.category === 'anh_ky_niem') {
        // Ảnh rọi lab theo khổ
        if (selectedPhotoFormat.includes('6x9')) {
          baseUnitCost = 1500;
          unitPrintCost = quantity >= 100 ? 1500 : quantity >= 30 ? 2500 : 4000;
        } else if (selectedPhotoFormat.includes('10x15')) {
          baseUnitCost = 2500;
          unitPrintCost = quantity >= 100 ? 3000 : quantity >= 30 ? 4500 : 7000;
        } else if (selectedPhotoFormat.includes('13x18')) {
          baseUnitCost = 4000;
          unitPrintCost = quantity >= 100 ? 5000 : quantity >= 30 ? 7500 : 12000;
        } else {
          baseUnitCost = 8000;
          unitPrintCost = quantity >= 100 ? 10000 : quantity >= 30 ? 15000 : 25000;
        }
      } else if (selectedProduct.category === 'khung_anh') {
        baseUnitCost = 25000;
        unitPrintCost = 8000;
      }
    }

    // Lamination fee for photo products
    let laminationCost = 0;
    if (selectedGroup === 'in_anh_thuong') {
      if (selectedLamination === 'can_bong' || selectedLamination === 'can_mo') laminationCost = 1000;
      if (selectedLamination === 'can_hologram') laminationCost = 2500;
      if (selectedLamination === 'ep_plastic') laminationCost = 3000;
    }

    // Frame fee
    let frameCost = 0;
    if (selectedFrameOption === 'khung_composite_de_ban') frameCost = 25000;
    if (selectedFrameOption === 'khung_go_treo_tuong') frameCost = 55000;

    // Extra position cost
    const extraPositionCost = positionsCount > 1 ? (positionsCount - 1) * (unitPrintCost * 0.7) : 0;
    const totalUnitPrint = unitPrintCost + extraPositionCost + laminationCost + frameCost;

    // Personalization cost
    const personalizeFee = personalizeCount * 5000;

    // Packaging cost per unit
    let packagingUnitCost = 0;
    if (packaging === 'hop_carton') packagingUnitCost = 3000;
    if (packaging === 'hop_xi_lot_lua') packagingUnitCost = 20000;
    if (packaging === 'tui_kraft') packagingUnitCost = 5000;

    // Volume Discount Tier
    let quantityDiscountRate = 0;
    if (quantity >= 500) quantityDiscountRate = 0.15;
    else if (quantity >= 200) quantityDiscountRate = 0.10;
    else if (quantity >= 50) quantityDiscountRate = 0.05;

    // Subtotal calculations
    const totalBlanks = baseUnitCost * quantity;
    const totalPrintWork = totalUnitPrint * quantity + setupFee + personalizeFee;
    const totalPackaging = packagingUnitCost * quantity;

    const rawSubtotal = totalBlanks + totalPrintWork + totalPackaging;
    const volumeDiscountAmount = rawSubtotal * quantityDiscountRate;
    const totalDiscount = volumeDiscountAmount;

    // Urgent fee
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
      laminationCost,
      frameCost,
      totalBlanks,
      totalPrintWork,
      totalPackaging,
      rawSubtotal,
      quantityDiscountRate: quantityDiscountRate * 100,
      volumeDiscountAmount,
      totalDiscount,
      urgentFee,
      subtotalAfterDiscount,
      vatAmount,
      grandTotal,
      finalUnitPrice,
    };
  }, [
    selectedProduct,
    selectedGroup,
    quantity,
    technique,
    positionsCount,
    personalizeCount,
    packaging,
    isUrgent,
    includeVAT,
    selectedPhotoFormat,
    selectedLamination,
    selectedFrameOption,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" /> Báo Giá In Ấn Quà Tặng & In Ảnh Theo Yêu Cầu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tính giá tự động theo barem phôi, công ép nhiệt Sublimation / in ảnh Lab, cán màng Hologram và số lượng.
          </p>
        </div>

        {/* Big Switch Tab for the 2 Business Lines */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => handleSwitchGroup('chuyen_nhiet')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              selectedGroup === 'chuyen_nhiet'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" /> In Chuyển Nhiệt (11 Sản Phẩm)
          </button>
          <button
            onClick={() => handleSwitchGroup('in_anh_thuong')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              selectedGroup === 'in_anh_thuong'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> In Ảnh & Nhãn Vở (3 Sản Phẩm)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Inputs & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Step 1: Chọn Sản Phẩm */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-blue-600" /> 1. Chọn Sản Phẩm / Phôi {selectedGroup === 'chuyen_nhiet' ? 'Chuyển Nhiệt' : 'In Ảnh & Nhãn Vở'}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {groupProducts.length} sản phẩm có sẵn
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {groupProducts.map((prod) => {
                const isSelected = selectedProductId === prod.id;
                const catInfo = PRODUCT_CATEGORIES_INFO[prod.category];
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      if (!prod.compatibleTechniques.includes(technique)) {
                        setTechnique(prod.compatibleTechniques[0] || 'chuyen_nhiet');
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? selectedGroup === 'chuyen_nhiet'
                          ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-1 ring-amber-500'
                          : 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {catInfo?.name || prod.category}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        Giá phôi: {formatCurrency(prod.basePrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Machine heat press preset info banner if Sublimation */}
          {selectedGroup === 'chuyen_nhiet' && selectedProduct?.heatPressSpecs && (
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-bold text-amber-900 dark:text-amber-300">Thông Số Ép Xưởng:</span>
                <span className="text-amber-800 dark:text-amber-200">
                  {selectedProduct.heatPressSpecs.temperatureC}°C • {selectedProduct.heatPressSpecs.timeSeconds}s • Lực {selectedProduct.heatPressSpecs.pressure}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                {selectedProduct.heatPressSpecs.recommendedMachine}
              </span>
            </div>
          )}

          {/* Step 2: Số Lượng Đặt Hàng */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" /> 2. Số Lượng Đặt Hàng
              </label>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {quantity} {selectedProduct?.unit || 'chiếc'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="500"
                step="1"
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
              {[1, 5, 10, 20, 35, 50, 100, 200, 500].map((qty) => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    quantity === qty
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {qty} {selectedProduct?.unit || 'c'}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Tùy Chọn Riêng Theo Từng Nhóm */}
          {selectedGroup === 'in_anh_thuong' ? (
            /* Photo Printing Specifics */
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> 3. Tùy Chọn Khổ Ảnh, Cán Màng & Khung Ảnh
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {selectedProduct.category === 'anh_ky_niem' && (
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Khổ ảnh in:</label>
                    <select
                      value={selectedPhotoFormat}
                      onChange={(e) => setSelectedPhotoFormat(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    >
                      <option value="6x9 cm (Polaroid)">Ảnh Polaroid 6x9 cm (Viền Retro)</option>
                      <option value="10x15 cm (4R)">Ảnh 10x15 cm (Khổ 4R tiêu chuẩn)</option>
                      <option value="13x18 cm (5R)">Ảnh 13x18 cm (Khổ 5R để bàn)</option>
                      <option value="15x21 cm (A5)">Ảnh 15x21 cm (Khổ A5)</option>
                      <option value="20x30 cm (A4)">Ảnh 20x30 cm (Khổ A4 phóng to)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Cán màng bảo vệ bề mặt:</label>
                  <select
                    value={selectedLamination}
                    onChange={(e) => setSelectedLamination(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="can_hologram">✨ Cán Màng Hologram 7 Màu Lấp Lánh (+2.500đ)</option>
                    <option value="can_bong">Cán Màng Bóng Siêu Trong (+1.000đ)</option>
                    <option value="can_mo">Cán Màng Mờ Chống Lóa (+1.000đ)</option>
                    <option value="ep_plastic">Ép Plastic Cứng 80mic (+3.000đ)</option>
                    <option value="khong_can">Không cán màng</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Lồng khung ảnh để bàn:</label>
                  <select
                    value={selectedFrameOption}
                    onChange={(e) => setSelectedFrameOption(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="khong_khung">Không lấy khung ảnh</option>
                    <option value="khung_composite_de_ban">Khung Composite để bàn (+25.000đ)</option>
                    <option value="khung_go_treo_tuong">Khung Gỗ lớn treo tường (+55.000đ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Bao bì & Túi đóng gói:</label>
                  <select
                    value={packaging}
                    onChange={(e) => setPackaging(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="khong_hop">Túi OPP dán miệng tiêu chuẩn</option>
                    <option value="hop_carton">Hộp Carton sóng bảo vệ (+3.000đ)</option>
                    <option value="tui_kraft">Túi Kraft quai xách (+5.000đ)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Sublimation Specifics */
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4" /> 3. Quy Cách In Chuyển Nhiệt & Cá Nhân Hóa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Số vị trí in / Số mặt in:</label>
                  <select
                    value={positionsCount}
                    onChange={(e) => setPositionsCount(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 Vị trí / 1 Mặt trước</option>
                    <option value={2}>2 Vị trí / In 2 mặt (+70% công in)</option>
                    <option value={3}>3 Vị trí / Quanh thân 360 độ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Hộp quà & Bao bì:</label>
                  <select
                    value={packaging}
                    onChange={(e) => setPackaging(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="khong_hop">Không hộp (Túi OPP / Xốp nổ có sẵn)</option>
                    <option value="hop_carton">Hộp Carton trắng quai xách (+3.000đ/c)</option>
                    <option value="hop_xi_lot_lua">Hộp Xi Nam Châm Lót Lụa VIP (+20.000đ/c)</option>
                    <option value="tui_kraft">Túi Giấy Kraft Xách Dây Dù (+5.000đ/c)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    In tên riêng / ảnh riêng từng cái ({personalizeCount} cái):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={quantity}
                      value={personalizeCount}
                      onChange={(e) => setPersonalizeCount(Math.min(quantity, Number(e.target.value)))}
                      placeholder="0"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 font-bold"
                    />
                    <span className="text-[11px] text-slate-500 shrink-0">+5k/tên</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      ⚡ Lệnh In Gấp / Hỏa Tốc (+20%)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
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
                  TỔNG CHI PHÍ DỰ TOÁN ({quantity} {selectedProduct?.unit || 'chiếc'})
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                    {formatCurrency(calculation.grandTotal)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  Đơn giá trọn gói:{' '}
                  <span className="text-blue-600 font-bold">
                    {formatCurrency(calculation.finalUnitPrice)}
                  </span>{' '}
                  / {selectedProduct?.unit || 'chiếc'}
                </p>
              </div>

              {/* Detailed Breakdown */}
              <div className="py-3 border-y border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tiền phôi sản phẩm ({quantity} {selectedProduct?.unit || 'chiếc'}):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(calculation.totalBlanks)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>
                    Công in ấn ({selectedGroup === 'chuyen_nhiet' ? 'In Chuyển Nhiệt' : 'In Ảnh / Decal'}):
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(calculation.unitPrintCost * quantity)}
                  </span>
                </div>

                {calculation.setupFee > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Phí chỉnh sửa file in số lượng ít:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(calculation.setupFee)}
                    </span>
                  </div>
                )}

                {calculation.personalizeFee > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Phí in tên / hình riêng ({personalizeCount} cái):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(calculation.personalizeFee)}
                    </span>
                  </div>
                )}

                {calculation.totalPackaging > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Bao bì & hộp quà:</span>
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
                    <span>Phụ phí hỏa tốc / gấp:</span>
                    <span>+ {formatCurrency(calculation.urgentFee)}</span>
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
                      serviceGroup: selectedGroup,
                      calculation,
                    });
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Tạo Đơn Hàng & Lệnh Sản Xuất In
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-indigo-600" /> Sinh VietQR Cọc
                  </button>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" /> In Báo Giá
                  </button>
                </div>
              </div>

              {/* Technical guidance info */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {selectedGroup === 'chuyen_nhiet'
                    ? 'Chất lượng mực chuyển nhiệt thăng hoa bám chắc vĩnh viễn, rửa ly hay giặt áo không phai màu.'
                    : 'Giấy ảnh RC phủ màng chống ẩm mốc, giữ màu sắc tươi tắn trên 10 năm.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showQrModal && calculation && (
        <VietQrModal
          customAmount={calculation.grandTotal}
          customOrderCode={`BAOGIA-${Date.now().toString().slice(-4)}`}
          customCustomerName={selectedProduct.name}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
