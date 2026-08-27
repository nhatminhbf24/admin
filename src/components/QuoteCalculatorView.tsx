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
  RefreshCw,
  Search
} from 'lucide-react';
import { GiftProduct, PrintTechnique, PrintServiceGroup, ProductCategory, QuoteCalculatedItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO, PRINT_SERVICE_GROUPS, PRODUCT_CATEGORIES_INFO } from '../data/mockData';
import { VietQrModal } from './VietQrModal';
import { DeliveryReceiptModal } from './DeliveryReceiptModal';
import { Order } from '../types';

interface QuoteCalculatorViewProps {
  products: GiftProduct[];
  onCreateOrderFromQuote: (quoteData: any) => void;
}

export interface ExtraServiceOption {
  id: string;
  name: string;
  price: number;
  unitText: string;
}

export const EXTRA_SERVICE_OPTIONS: ExtraServiceOption[] = [
  { id: 'goi_giay', name: 'Gói giấy thường', price: 10000, unitText: '+10.000đ/c' },
  { id: 'hop_dung', name: 'Hộp đựng', price: 3000, unitText: '+3.000đ/c' },
  { id: 'in_ten_rieng', name: 'In tên riêng', price: 5000, unitText: '+5.000đ/tên' },
  { id: 'lay_khung_anh', name: 'Lấy khung ảnh', price: 50000, unitText: '+50.000đ/c' },
];

export const QuoteCalculatorView: React.FC<QuoteCalculatorViewProps> = ({
  products = [],
  onCreateOrderFromQuote,
}) => {
  // Search & Filter for Unified Product Catalog
  const [productSearch, setProductSearch] = useState<string>('');

  // Filter products by search
  const filteredProducts = useMemo(() => {
    return (products || []).filter((p) => {
      if (!productSearch.trim()) return true;
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  // Current configuring item state
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50);
  
  // Dịch vụ thêm: Ô tích chọn (cho phép chọn nhiều dịch vụ cùng một lúc)
  const [selectedExtraServices, setSelectedExtraServices] = useState<string[]>([]);

  // Cho phép tự do chỉnh sửa "Đơn giá món này"
  const [customUnitPrice, setCustomUnitPrice] = useState<string>('');

  // Photo Printing specifics (nếu chọn sản phẩm mảng in ảnh)
  const [selectedPhotoFormat, setSelectedPhotoFormat] = useState<string>('6x9 cm (Polaroid)');
  const [selectedLamination, setSelectedLamination] = useState<'khong_can' | 'can_bong' | 'can_mo' | 'can_hologram' | 'ep_plastic'>('can_hologram');

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
      descriptionSummary: 'Hộp đựng (+3.000đ/c)',
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
      positionsCount: 1,
      packaging: 'khong_hop',
      personalizeCount: 0,
      unitPrintCost: 6500,
      finalUnitPrice: 11500,
      totalPrice: 1150000,
      descriptionSummary: 'In tiêu chuẩn',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
    },
  ]);

  // Overall Quote Settings (Khách hàng, Chiết khấu, VAT, Hỏa tốc, Ship)
  const [customerName, setCustomerName] = useState<string>('Công ty / Khách hàng đặt in quà tặng');
  const [customerPhone, setCustomerPhone] = useState<string>('0988.123.456');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);
  const [includeVAT, setIncludeVAT] = useState<boolean>(false);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showPrintA5Modal, setShowPrintA5Modal] = useState<boolean>(false);

  const selectedProduct = (products || []).find((p) => p.id === selectedProductId) || filteredProducts[0] || products[0];

  // Toggle selection for extra services
  const handleToggleExtraService = (serviceId: string) => {
    setSelectedExtraServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  // Pricing calculation logic for currently selected single item
  const currentItemCalculation = useMemo(() => {
    if (!selectedProduct) return null;

    let baseUnitCost = selectedProduct.basePrice;
    let unitPrintCost = 0;
    let setupFee = 0;

    switch (selectedProduct.category) {
      case 'ly_su':
        unitPrintCost = quantity >= 500 ? 6000 : quantity >= 100 ? 9000 : quantity >= 30 ? 14000 : 25000;
        setupFee = quantity < 10 ? 30000 : 0;
        break;
      case 'moc_khoa':
        unitPrintCost = quantity >= 500 ? 3000 : quantity >= 100 ? 5000 : quantity >= 30 ? 8000 : 15000;
        setupFee = quantity < 10 ? 30000 : 0;
        break;
      case 'huy_hieu':
        unitPrintCost = quantity >= 500 ? 2500 : quantity >= 100 ? 4000 : quantity >= 30 ? 7000 : 12000;
        setupFee = quantity < 10 ? 30000 : 0;
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
      case 'in_nhan_vo':
        baseUnitCost = selectedProduct.basePrice || 12000;
        unitPrintCost = quantity >= 100 ? 10000 : quantity >= 30 ? 16000 : 25000;
        break;
      case 'anh_ky_niem':
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
        break;
      case 'khung_anh':
        baseUnitCost = selectedProduct.basePrice || 25000;
        unitPrintCost = 8000;
        break;
      default:
        unitPrintCost = 10000;
    }

    // Lamination fee for photos/decals
    let laminationCost = 0;
    if (selectedProduct.category === 'anh_ky_niem' || selectedProduct.serviceGroup === 'in_anh_thuong') {
      if (selectedLamination === 'can_bong' || selectedLamination === 'can_mo') laminationCost = 1000;
      if (selectedLamination === 'can_hologram') laminationCost = 2500;
      if (selectedLamination === 'ep_plastic') laminationCost = 3000;
    }

    const totalUnitPrint = unitPrintCost + laminationCost;

    // Dịch vụ thêm (tính tổng chi phí các dịch vụ được tích chọn)
    const extraServiceUnitCost = selectedExtraServices.reduce((sum, id) => {
      const opt = EXTRA_SERVICE_OPTIONS.find((o) => o.id === id);
      return sum + (opt ? opt.price : 0);
    }, 0);

    const selectedExtraLabels = selectedExtraServices
      .map((id) => {
        const opt = EXTRA_SERVICE_OPTIONS.find((o) => o.id === id);
        return opt ? `${opt.name} (${opt.unitText})` : '';
      })
      .filter(Boolean);

    // Subtotal tính toán tự động
    const totalBlanks = baseUnitCost * quantity;
    const totalPrintWork = totalUnitPrint * quantity + setupFee;
    const totalExtra = extraServiceUnitCost * quantity;
    const autoCalculatedTotal = totalBlanks + totalPrintWork + totalExtra;
    const autoCalculatedUnitPrice = Math.round(autoCalculatedTotal / quantity);

    // Sử dụng đơn giá tùy chỉnh nếu user nhập số hợp lệ, ngược lại dùng autoCalculatedUnitPrice
    const parsedCustom = customUnitPrice !== '' ? Number(customUnitPrice) : null;
    const effectiveUnitPrice = parsedCustom !== null && !isNaN(parsedCustom) && parsedCustom >= 0
      ? parsedCustom
      : autoCalculatedUnitPrice;

    const itemTotal = effectiveUnitPrice * quantity;

    // Summary specs string
    let summary = selectedExtraLabels.length > 0 ? selectedExtraLabels.join(' • ') : 'In ấn tiêu chuẩn';
    if (selectedProduct.category === 'anh_ky_niem') {
      summary += ` • ${selectedPhotoFormat} • ${
        selectedLamination === 'can_hologram' ? 'Màng Hologram' : selectedLamination === 'ep_plastic' ? 'Ép Plastic' : selectedLamination !== 'khong_can' ? 'Cán bóng/mờ' : 'Không cán'
      }`;
    }

    return {
      baseUnitCost,
      unitPrintCost: totalUnitPrint,
      extraServiceUnitCost,
      autoCalculatedUnitPrice,
      effectiveUnitPrice,
      itemTotal,
      summary,
    };
  }, [
    selectedProduct,
    quantity,
    selectedExtraServices,
    customUnitPrice,
    selectedPhotoFormat,
    selectedLamination,
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
      technique: selectedProduct.compatibleTechniques?.[0] || 'chuyen_nhiet',
      positionsCount: 1,
      packaging: selectedExtraServices.includes('hop_dung') ? 'hop_carton' : 'khong_hop',
      personalizeCount: selectedExtraServices.includes('in_ten_rieng') ? quantity : 0,
      photoFormat: selectedProduct.category === 'anh_ky_niem' ? selectedPhotoFormat : undefined,
      lamination: selectedProduct.category === 'anh_ky_niem' ? selectedLamination : undefined,
      unitPrintCost: currentItemCalculation.unitPrintCost,
      finalUnitPrice: currentItemCalculation.effectiveUnitPrice,
      totalPrice: currentItemCalculation.itemTotal,
      descriptionSummary: currentItemCalculation.summary,
      imageUrl: selectedProduct.imageUrl,
    };

    setQuoteItems((prev) => [...prev, newItem]);
    // Reset custom unit price after adding
    setCustomUnitPrice('');
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

    const grandTotal = subtotalAfterDiscount + urgentFee + vatAmount + (shippingFee || 0);
    const depositAmount50 = Math.round(grandTotal * 0.5);

    return {
      totalItemsCount,
      subtotal,
      discountAmount,
      urgentFee,
      vatAmount,
      shippingFee: shippingFee || 0,
      grandTotal,
      depositAmount50,
    };
  }, [quoteItems, overallDiscountPercent, isUrgent, includeVAT, shippingFee]);

  // Total goods value before adding shipping (for accurate receipt alignment)
  const totalGoodsAmount = overallCalculations.grandTotal - (shippingFee || 0);

  // Convert current quote state into an Order object for instant A5 printing & receipt generation
  const quoteAsOrder: Order = useMemo(() => {
    return {
      id: `quote-${Date.now()}`,
      orderCode: `BG-2608-${Math.floor(10 + Math.random() * 90)}`,
      customerName: customerName.trim() || 'Khách hàng Báo giá',
      customerPhone: customerPhone.trim() || '0988.123.456',
      customerCompany: customerName.trim() || 'Công ty / Đơn vị đặt in quà tặng',
      serviceGroup: selectedProduct?.serviceGroup || 'chuyen_nhiet',
      status: 'dang_thiet_ke',
      priority: isUrgent ? 'hoa_toc' : 'binh_thuong',
      paymentStatus: overallCalculations.depositAmount50 > 0 ? 'da_coc_50' : 'chua_coc',
      totalAmount: totalGoodsAmount,
      depositAmount: overallCalculations.depositAmount50,
      shippingFeeCollected: shippingFee > 0 ? shippingFee : 0,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      shippingAddress: customerAddress.trim() || 'Nhận trực tiếp tại xưởng in',
      productionNotes: `Báo giá ${quoteItems.length} món. ${customerAddress.trim() ? `Đ/C: ${customerAddress.trim()}. ` : ''}${shippingFee > 0 ? `Ship: ${formatCurrency(shippingFee)}. ` : ''}${includeVAT ? 'Bao gồm VAT (8%). ' : ''}${overallDiscountPercent > 0 ? `Chiết khấu ${overallDiscountPercent}%. ` : ''}${isUrgent ? 'Lệnh in hỏa tốc (+20%).' : ''}`,
      items: quoteItems.map((item, idx) => ({
        id: item.id || `q-item-${idx + 1}`,
        productName: item.productName,
        sku: item.sku,
        category: item.category,
        serviceGroup: item.serviceGroup,
        quantity: item.quantity,
        unitPrice: item.finalUnitPrice,
        printPricePerUnit: item.unitPrintCost,
        printPositions: [],
        mockupUrl: item.imageUrl || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
        proofApproved: false,
        notes: item.descriptionSummary,
      })),
    };
  }, [quoteItems, customerName, customerPhone, customerAddress, shippingFee, selectedProduct, isUrgent, includeVAT, overallDiscountPercent, overallCalculations, totalGoodsAmount]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-rose-500" /> Báo Giá In Ấn Quà Tặng Đa Sản Phẩm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tính giá linh hoạt toàn bộ danh mục sản phẩm, hỗ trợ thêm nhiều sản phẩm vào cùng 1 bảng báo giá tổng hợp, sinh VietQR cọc & xuất phiếu in A5.
          </p>
        </div>

        {/* Quick Search & Count Badge */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm / SKU..."
              className="w-48 sm:w-64 px-3 py-1.5 pl-8 text-xs bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500"
            />
            <Gift className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {productSearch && (
              <button
                onClick={() => setProductSearch('')}
                className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT CONFIGURATOR (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Step 1: Chọn Sản Phẩm trong Danh Sách Hợp Nhất */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-rose-500" /> 1. Chọn Sản Phẩm Cần Báo Giá
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {filteredProducts.length} / {products.length} sản phẩm
              </span>
            </label>

            {/* Unified Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredProducts.map((prod) => {
                const isSelected = selectedProductId === prod.id;
                const catInfo = PRODUCT_CATEGORIES_INFO[prod.category as ProductCategory];
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      setCustomUnitPrice('');
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
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                          {catInfo?.name || prod.category}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {prod.name}
                      </p>
                      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1">
                        Phôi: {formatCurrency(prod.basePrice)} / {prod.unit}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2 & 3: Số lượng + Đơn giá cùng 1 hàng */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                2. Số Lượng ({selectedProduct?.unit || 'Chiếc'})
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500 font-bold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  3. Đơn Giá ({selectedProduct?.unit || 'Chiếc'})
                </label>
                {customUnitPrice !== '' && (
                  <button
                    type="button"
                    onClick={() => setCustomUnitPrice('')}
                    className="text-[10.5px] text-slate-400 hover:text-rose-500 underline"
                    title="Khôi phục giá tự tính"
                  >
                    Khôi phục
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={customUnitPrice !== '' ? customUnitPrice : (currentItemCalculation?.autoCalculatedUnitPrice ?? '')}
                  onChange={(e) => setCustomUnitPrice(e.target.value)}
                  placeholder={String(currentItemCalculation?.autoCalculatedUnitPrice || 0)}
                  className="w-full text-sm font-bold font-mono text-rose-600 dark:text-rose-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 outline-none focus:border-rose-500"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                  đ
                </span>
              </div>
            </div>
          </div>

          {/* Step 4: Dịch Vụ Thêm (Ô tích chọn nhiều dịch vụ cùng lúc) */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                4. Dịch Vụ Thêm (Tích chọn nhiều tùy chọn)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {EXTRA_SERVICE_OPTIONS.map((opt) => {
                  const isChecked = selectedExtraServices.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleToggleExtraService(opt.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all text-xs ${
                        isChecked
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 font-semibold ring-1 ring-rose-400/50'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by container onClick
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                        />
                        <span>{opt.name}</span>
                      </div>
                      <span className={`text-[11px] font-mono ${isChecked ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400'}`}>
                        {opt.unitText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* In ảnh specifics (Khổ ảnh & Cán màng nếu sản phẩm là Ảnh) */}
            {selectedProduct?.category === 'anh_ky_niem' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Khổ ảnh in:</label>
                  <select
                    value={selectedPhotoFormat}
                    onChange={(e) => setSelectedPhotoFormat(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="6x9 cm (Polaroid)">Ảnh Polaroid 6x9 cm (Viền Retro)</option>
                    <option value="10x15 cm (4R)">Ảnh 10x15 cm (Khổ 4R tiêu chuẩn)</option>
                    <option value="13x18 cm (5R)">Ảnh 13x18 cm (Khổ 5R để bàn)</option>
                    <option value="15x21 cm (A5)">Ảnh 15x21 cm (Khổ A5)</option>
                    <option value="20x30 cm (A4)">Ảnh 20x30 cm (Khổ A4 phóng to)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Cán màng bảo vệ:</label>
                  <select
                    value={selectedLamination}
                    onChange={(e) => setSelectedLamination(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="can_hologram">✨ Cán Màng Hologram 7 Màu (+2.500đ)</option>
                    <option value="can_bong">Cán Màng Bóng Siêu Trong (+1.000đ)</option>
                    <option value="can_mo">Cán Màng Mờ Chống Lóa (+1.000đ)</option>
                    <option value="ep_plastic">Ép Plastic Cứng 80mic (+3.000đ)</option>
                    <option value="khong_can">Không cán màng</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Button: Thêm Sản Phẩm Này Vào Báo Giá */}
          <button
            type="button"
            onClick={handleAddCurrentItemToQuote}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Sản Phẩm Này Vào Báo Giá ({formatCurrency(currentItemCalculation?.itemTotal || 0)})
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
              <div className="grid grid-cols-12 gap-2 text-xs">
                <div className="col-span-7 sm:col-span-8">
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Địa chỉ giao hàng..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 text-[11px]"
                  />
                </div>
                <div className="col-span-5 sm:col-span-4">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={shippingFee || ''}
                    onChange={(e) => setShippingFee(Math.max(0, Number(e.target.value)))}
                    placeholder="Giá Ship (đ)..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-mono font-semibold text-[11px] text-right"
                  />
                </div>
              </div>
            </div>

            {/* List of Added Quote Items */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 border-t border-b border-slate-100 dark:border-slate-800 py-3">
              {quoteItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Chưa có sản phẩm nào trong bảng báo giá.
                  <p className="text-[11px] mt-0.5">Chọn sản phẩm bên trái và nhấn "Thêm Sản Phẩm Này Vào Báo Giá".</p>
                </div>
              ) : (
                quoteItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.productName}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate pl-5">
                        SL: <span className="font-bold text-slate-700 dark:text-slate-200">{item.quantity}</span> x{' '}
                        {formatCurrency(item.finalUnitPrice)} • {item.descriptionSummary}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                        {formatCurrency(item.totalPrice)}
                      </span>
                      <button
                        onClick={() => handleRemoveQuoteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Xóa mặt hàng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quote Extra Modifiers (Discount, VAT, Urgent) */}
            <div className="mt-3 pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Chiết khấu tổng (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={overallDiscountPercent}
                    onChange={(e) => setOverallDiscountPercent(Math.max(0, Math.min(50, Number(e.target.value))))}
                    className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-1">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[11px] text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeVAT}
                      onChange={(e) => setIncludeVAT(e.target.checked)}
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <span>Xuất VAT 8%</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[11px] text-amber-600 dark:text-amber-400">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>In hỏa tốc (+20%)</span>
                  </label>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="pt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Tiền hàng ({overallCalculations.totalItemsCount} sp):</span>
                  <span className="font-mono">{formatCurrency(overallCalculations.subtotal)}</span>
                </div>

                {overallCalculations.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Chiết khấu ({overallDiscountPercent}%):</span>
                    <span>- {formatCurrency(overallCalculations.discountAmount)}</span>
                  </div>
                )}

                {overallCalculations.urgentFee > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Phí in hỏa tốc:</span>
                    <span>+ {formatCurrency(overallCalculations.urgentFee)}</span>
                  </div>
                )}

                {overallCalculations.vatAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Thuế VAT (8%):</span>
                    <span>+ {formatCurrency(overallCalculations.vatAmount)}</span>
                  </div>
                )}

                {overallCalculations.shippingFee > 0 && (
                  <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
                    <span>Phí vận chuyển (Ship):</span>
                    <span>+ {formatCurrency(overallCalculations.shippingFee)}</span>
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
                    customerAddress,
                    shippingAddress: customerAddress,
                    shippingFee,
                    multiItems: quoteItems,
                    grandTotal: overallCalculations.grandTotal,
                    depositAmount: overallCalculations.depositAmount50,
                    isUrgent,
                  });
                }}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> ⚡ Tạo Đơn Hàng Nhiều Sản Phẩm Ngay
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={quoteItems.length === 0}
                  onClick={() => setShowQrModal(true)}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-indigo-600" /> Sinh VietQR Cọc 50%
                </button>

                <button
                  disabled={quoteItems.length === 0}
                  onClick={() => setShowPrintA5Modal(true)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Xuất phiếu báo giá in ấn khổ A5 chuẩn đẹp kèm mã QR đặt cọc"
                >
                  <Printer className="w-4 h-4 text-rose-500" /> In Báo Giá A5
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instant A5 Quotation Print Modal */}
      {showPrintA5Modal && quoteAsOrder && (
        <DeliveryReceiptModal
          order={quoteAsOrder}
          initialPaperSize="A5"
          initialReceiptTitle="BẢNG BÁO GIÁ SẢN PHẨM"
          modalTitle="Xuất Báo Giá In Ấn"
          initialShippingFee={shippingFee}
          onClose={() => setShowPrintA5Modal(false)}
        />
      )}

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
