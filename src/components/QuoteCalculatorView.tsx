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
  Camera,
  Tag,
  Maximize,
  Clock,
  Thermometer,
  Trash2,
  ShoppingBag,
  QrCode,
  FileText,
  Plus,
  RefreshCw
} from 'lucide-react';
import { GiftProduct, PrintTechnique, PrintServiceGroup, ProductCategory, QuoteCalculatedItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO, PRINT_SERVICE_GROUPS, PRODUCT_CATEGORIES_INFO } from '../data/mockData';
import { VietQrModal } from './VietQrModal';

interface QuoteCalculatorViewProps {
  products: GiftProduct[];
  onCreateOrderFromQuote: (quoteData: any) => void;
}

export const QuoteCalculatorView: React.FC<QuoteCalculatorViewProps> = ({
  products = [],
  onCreateOrderFromQuote,
}) => {
  // Service Group Tab Filter
  const [selectedGroup, setSelectedGroup] = useState<PrintServiceGroup>('chuyen_nhiet');

  // Filter products by selected service group
  const groupProducts = useMemo(() => {
    return (products || []).filter((p) => p.serviceGroup === selectedGroup);
  }, [products, selectedGroup]);

  // Current configuring item state
  const [selectedProductId, setSelectedProductId] = useState<string>(groupProducts[0]?.id || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50);
  const [technique, setTechnique] = useState<PrintTechnique>('chuyen_nhiet');
  const [positionsCount, setPositionsCount] = useState<number>(1);
  const [personalizeCount, setPersonalizeCount] = useState<number>(0);
  const [packaging, setPackaging] = useState<'khong_hop' | 'hop_carton' | 'hop_xi_lot_lua' | 'tui_kraft'>('hop_carton');

  // Photo Printing specifics
  const [selectedPhotoFormat, setSelectedPhotoFormat] = useState<string>('6x9 cm (Polaroid)');
  const [selectedLamination, setSelectedLamination] = useState<'khong_can' | 'can_bong' | 'can_mo' | 'can_hologram' | 'ep_plastic'>('can_hologram');
  const [selectedFrameOption, setSelectedFrameOption] = useState<'khong_khung' | 'khung_composite_de_ban' | 'khung_go_treo_tuong'>('khong_khung');

  // Multi-Item Quote List state
  const [quoteItems, setQuoteItems] = useState<QuoteCalculatedItem[]>([
    {
      id: 'q-item-1',
      productId: 'prod-cn-1',
      productName: 'Ly Sứ Trắng Quai Tròn 350ml Phủ Men In Chuyển Nhiệt',
      sku: 'LYSU-TRANG-TRON-350',
      category: 'ly_su',
      serviceGroup: 'chuyen_nhiet',
      unit: 'Chiếc',
      basePrice: 18000,
      quantity: 50,
      technique: 'chuyen_nhiet',
      positionsCount: 1,
      packaging: 'hop_carton',
      personalizeCount: 0,
      unitPrintCost: 12000,
      finalUnitPrice: 33000,
      totalPrice: 1650000,
      descriptionSummary: 'In 1 vị trí • Hộp Carton trắng quai xách',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 'q-item-2',
      productId: 'prod-cn-3',
      productName: 'Móc Khóa Mica Trong Suốt Cắt Theo Hình',
      sku: 'MK-MICA-TRONG',
      category: 'moc_khoa',
      serviceGroup: 'chuyen_nhiet',
      unit: 'Chiếc',
      basePrice: 5000,
      quantity: 100,
      technique: 'chuyen_nhiet',
      positionsCount: 2,
      packaging: 'khong_hop',
      personalizeCount: 0,
      unitPrintCost: 6500,
      finalUnitPrice: 11500,
      totalPrice: 1150000,
      descriptionSummary: 'In 2 mặt full màu • Túi OPP',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
    },
  ]);

  // Overall Quote Settings (Khách hàng, Chiết khấu, VAT, Hỏa tốc)
  const [customerName, setCustomerName] = useState<string>('Công ty / Khách hàng đặt in quà tặng');
  const [customerPhone, setCustomerPhone] = useState<string>('0988.123.456');
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);
  const [includeVAT, setIncludeVAT] = useState<boolean>(false);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Switch Business Group Tab
  const handleSwitchGroup = (group: PrintServiceGroup) => {
    setSelectedGroup(group);
    const newGroupProds = (products || []).filter((p) => p.serviceGroup === group);
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

  const selectedProduct = (products || []).find((p) => p.id === selectedProductId) || groupProducts[0] || products[0];

  // Pricing calculation logic for currently selected single item
  const currentItemCalculation = useMemo(() => {
    if (!selectedProduct) return null;

    let baseUnitCost = selectedProduct.basePrice;
    let unitPrintCost = 0;
    let setupFee = 0;

    if (selectedGroup === 'chuyen_nhiet') {
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
        default:
          unitPrintCost = 12000;
      }
      setupFee = quantity < 10 ? 30000 : 0;
    } else {
      if (selectedProduct.category === 'in_nhan_vo') {
        baseUnitCost = 12000;
        unitPrintCost = quantity >= 100 ? 10000 : quantity >= 30 ? 16000 : 25000;
      } else if (selectedProduct.category === 'anh_ky_niem') {
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

    // Lamination fee
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

    // Subtotal
    const totalBlanks = baseUnitCost * quantity;
    const totalPrintWork = totalUnitPrint * quantity + setupFee + personalizeFee;
    const totalPackaging = packagingUnitCost * quantity;
    const itemTotal = totalBlanks + totalPrintWork + totalPackaging;
    const finalUnitPrice = Math.round(itemTotal / quantity);

    // Summary specs string
    let summary = `In ${positionsCount} vị trí`;
    if (packaging === 'hop_carton') summary += ' • Hộp Carton';
    if (packaging === 'hop_xi_lot_lua') summary += ' • Hộp Xi Lót Lụa VIP';
    if (packaging === 'tui_kraft') summary += ' • Túi Kraft';
    if (selectedGroup === 'in_anh_thuong') {
      summary = `${selectedPhotoFormat} • ${
        selectedLamination === 'can_hologram' ? 'Màng Hologram 7 màu' : 'Cán bóng/mờ'
      }`;
    }
    if (personalizeCount > 0) summary += ` • ${personalizeCount} tên riêng`;

    return {
      baseUnitCost,
      unitPrintCost: totalUnitPrint,
      packagingUnitCost,
      itemTotal,
      finalUnitPrice,
      summary,
    };
  }, [
    selectedProduct,
    selectedGroup,
    quantity,
    technique,
    positionsCount,
    personalizeCount,
    packaging,
    selectedPhotoFormat,
    selectedLamination,
    selectedFrameOption,
  ]);

  // Handler: Add currently configured item to multi-item quote table
  const handleAddCurrentItemToQuote = () => {
    if (!selectedProduct || !currentItemCalculation) return;

    const newItem: QuoteCalculatedItem = {
      id: `q-item-${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      category: selectedProduct.category,
      serviceGroup: selectedProduct.serviceGroup,
      unit: selectedProduct.unit,
      basePrice: selectedProduct.basePrice,
      quantity,
      technique,
      positionsCount,
      packaging,
      personalizeCount,
      photoFormat: selectedGroup === 'in_anh_thuong' ? selectedPhotoFormat : undefined,
      lamination: selectedGroup === 'in_anh_thuong' ? selectedLamination : undefined,
      frameOption: selectedGroup === 'in_anh_thuong' ? selectedFrameOption : undefined,
      unitPrintCost: currentItemCalculation.unitPrintCost,
      finalUnitPrice: currentItemCalculation.finalUnitPrice,
      totalPrice: currentItemCalculation.itemTotal,
      descriptionSummary: currentItemCalculation.summary,
      imageUrl: selectedProduct.imageUrl,
    };

    setQuoteItems((prev) => [...prev, newItem]);
  };

  // Handler: Remove item from multi-item quote table
  const handleRemoveQuoteItem = (itemId: string) => {
    setQuoteItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Multi-Item Overall Calculations
  const overallCalculations = useMemo(() => {
    const totalItemsCount = quoteItems.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = quoteItems.reduce((sum, i) => sum + i.totalPrice, 0);

    const discountAmount = (subtotal * overallDiscountPercent) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;

    const urgentFee = isUrgent ? subtotalAfterDiscount * 0.2 : 0;
    const vatAmount = includeVAT ? (subtotalAfterDiscount + urgentFee) * 0.08 : 0;

    const grandTotal = subtotalAfterDiscount + urgentFee + vatAmount;
    const depositAmount50 = Math.round(grandTotal * 0.5);

    return {
      totalItemsCount,
      subtotal,
      discountAmount,
      urgentFee,
      vatAmount,
      grandTotal,
      depositAmount50,
    };
  }, [quoteItems, overallDiscountPercent, isUrgent, includeVAT]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-rose-500" /> Báo Giá In Ấn Quà Tặng Đa Sản Phẩm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tính giá linh hoạt, hỗ trợ thêm nhiều sản phẩm vào cùng 1 bảng báo giá tổng hợp, sinh VietQR cọc & tạo đơn xưởng 1-click.
          </p>
        </div>

        {/* Big Switch Tab for the 2 Business Lines */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => handleSwitchGroup('chuyen_nhiet')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              selectedGroup === 'chuyen_nhiet'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" /> In Chuyển Nhiệt Sublimation
          </button>
          <button
            onClick={() => handleSwitchGroup('in_anh_thuong')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              selectedGroup === 'in_anh_thuong'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> In Ảnh & Decal Nhãn Vở
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT CONFIGURATOR (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Step 1: Chọn Sản Phẩm */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-rose-500" /> 1. Chọn Phôi / Sản Phẩm Cần Báo Giá
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {groupProducts.length} sản phẩm có sẵn
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {groupProducts.map((prod) => {
                const isSelected = selectedProductId === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      if (!prod.compatibleTechniques.includes(technique)) {
                        setTechnique(prod.compatibleTechniques[0] || 'chuyen_nhiet');
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-1 ring-rose-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {prod.sku}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">
                        {prod.name}
                      </p>
                      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        Phôi: {formatCurrency(prod.basePrice)} / {prod.unit}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Số lượng & Quy cách */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                2. Số Lượng ({selectedProduct?.unit || 'Chiếc'})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500 font-bold"
                />
                <div className="flex gap-1 shrink-0">
                  {[20, 50, 100, 200].map((quickQty) => (
                    <button
                      key={quickQty}
                      type="button"
                      onClick={() => setQuantity(quickQty)}
                      className={`px-2 py-1 text-[11px] rounded-lg font-semibold border ${
                        quantity === quickQty
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {quickQty}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Kỹ Thuật Ép / In
              </label>
              <select
                value={technique}
                onChange={(e) => setTechnique(e.target.value as PrintTechnique)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500 font-medium"
              >
                {selectedProduct?.compatibleTechniques.map((t) => (
                  <option key={t} value={t}>
                    {PRINT_TECHNIQUES_INFO[t]?.name || t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 3: Tùy Chọn Chi Tiết Từng Dây Chuyền */}
          {selectedGroup === 'in_anh_thuong' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedProduct?.category === 'anh_ky_niem' && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Khổ ảnh in:</label>
                  <select
                    value={selectedPhotoFormat}
                    onChange={(e) => setSelectedPhotoFormat(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500"
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
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Cán màng bảo vệ:</label>
                <select
                  value={selectedLamination}
                  onChange={(e) => setSelectedLamination(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500"
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
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500"
                >
                  <option value="khong_khung">Không lấy khung ảnh</option>
                  <option value="khung_composite_de_ban">Khung Composite để bàn (+25.000đ)</option>
                  <option value="khung_go_treo_tuong">Khung Gỗ lớn treo tường (+55.000đ)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Bao bì đóng gói:</label>
                <select
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500"
                >
                  <option value="khong_hop">Túi OPP dán miệng tiêu chuẩn</option>
                  <option value="hop_carton">Hộp Carton sóng bảo vệ (+3.000đ)</option>
                  <option value="tui_kraft">Túi Kraft quai xách (+5.000đ)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Số vị trí / Mặt in:</label>
                <select
                  value={positionsCount}
                  onChange={(e) => setPositionsCount(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500"
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
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500"
                >
                  <option value="khong_hop">Không hộp (Túi OPP / Xốp nổ có sẵn)</option>
                  <option value="hop_carton">Hộp Carton trắng quai xách (+3.000đ/c)</option>
                  <option value="hop_xi_lot_lua">Hộp Xi Nam Châm Lót Lụa VIP (+20.000đ/c)</option>
                  <option value="tui_kraft">Túi Giấy Kraft Xách Dây Dù (+5.000đ/c)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  In tên riêng / ảnh riêng ({personalizeCount} cái):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={quantity}
                    value={personalizeCount}
                    onChange={(e) => setPersonalizeCount(Math.min(quantity, Number(e.target.value)))}
                    placeholder="0"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-rose-500 font-bold"
                  />
                  <span className="text-[11px] text-slate-500 shrink-0">+5k/tên</span>
                </div>
              </div>

              <div className="flex items-end pb-1">
                {currentItemCalculation && (
                  <div className="w-full p-2.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                    <span className="text-[11px] text-rose-800 dark:text-rose-300 font-semibold">
                      Đơn giá món này:
                    </span>
                    <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">
                      {formatCurrency(currentItemCalculation.finalUnitPrice)} / {selectedProduct?.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Button: Add to Multi-Item Quote Table */}
          <button
            type="button"
            onClick={handleAddCurrentItemToQuote}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" /> + Thêm Mặt Hàng Này Vào Bảng Báo Giá Tổng Hợp ({formatCurrency(currentItemCalculation?.itemTotal || 0)})
          </button>
        </div>

        {/* ================= RIGHT MULTI-ITEM QUOTE SUMMARY (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-rose-500/40 dark:border-rose-600/40 shadow-xl shadow-rose-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Báo Giá Đa Sản Phẩm ({quoteItems.length} Món)
            </div>

            {/* Customer Inputs */}
            <div className="mb-4 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-500" /> Thông Tin Khách Hàng / Đơn Vị
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tên khách / Công ty..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-semibold text-[11px]"
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Số điện thoại..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* List of Added Quote Items */}
            <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 max-h-64 overflow-y-auto pr-1">
              {quoteItems.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Chưa có sản phẩm nào. Hãy chọn phôi ở bảng bên trái và bấm <strong>"+ Thêm Mặt Hàng"</strong>.
                </div>
              ) : (
                quoteItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {item.productName}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {item.descriptionSummary}
                      </p>
                      <div className="flex items-center gap-2 mt-1 font-mono text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.quantity} {item.unit} &times; {formatCurrency(item.finalUnitPrice)}
                        </span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          = {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveQuoteItem(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Xóa món này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Discount & Add-on Controls */}
            <div className="pt-3 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Chiết khấu tổng đơn (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={overallDiscountPercent}
                    onChange={(e) => setOverallDiscountPercent(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex flex-col justify-end gap-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeVAT}
                      onChange={(e) => setIncludeVAT(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                    />
                    <span>Xuất hóa đơn VAT (8%)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                    />
                    <span>⚡ Lệnh in hỏa tốc (+20%)</span>
                  </label>
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tổng tiền hàng ({overallCalculations.totalItemsCount} món):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(overallCalculations.subtotal)}
                  </span>
                </div>

                {overallCalculations.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Chiết khấu ({overallDiscountPercent}%):</span>
                    <span>- {formatCurrency(overallCalculations.discountAmount)}</span>
                  </div>
                )}

                {overallCalculations.urgentFee > 0 && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold">
                    <span>Phụ phí hỏa tốc (+20%):</span>
                    <span>+ {formatCurrency(overallCalculations.urgentFee)}</span>
                  </div>
                )}

                {overallCalculations.vatAmount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
                    <span>Thuế VAT (8%):</span>
                    <span>+ {formatCurrency(overallCalculations.vatAmount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    TỔNG THANH TOÁN BÁO GIÁ:
                  </span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                    {formatCurrency(overallCalculations.grandTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                  <span>Tiền đặt cọc tối thiểu (50%):</span>
                  <span className="text-rose-600 font-bold font-mono">
                    {formatCurrency(overallCalculations.depositAmount50)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
              <button
                disabled={quoteItems.length === 0}
                onClick={() => {
                  onCreateOrderFromQuote({
                    customerName,
                    customerPhone,
                    multiItems: quoteItems,
                    grandTotal: overallCalculations.grandTotal,
                    depositAmount: overallCalculations.depositAmount50,
                    isUrgent,
                  });
                }}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> ⚡ Tạo Đơn Hàng Nhiều Sản Phẩm Ngay
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={quoteItems.length === 0}
                  onClick={() => setShowQrModal(true)}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <QrCode className="w-4 h-4 text-indigo-600" /> Sinh VietQR Cọc 50%
                </button>

                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" /> In Báo Giá A4
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQrModal && overallCalculations.depositAmount50 > 0 && (
        <VietQrModal
          customAmount={overallCalculations.depositAmount50}
          customOrderCode={`BAOGIA-${Date.now().toString().slice(-4)}`}
          customCustomerName={customerName}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
