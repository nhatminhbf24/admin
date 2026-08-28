import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Gift,
  Printer,
  Package,
  Trash2,
  QrCode,
  FileText,
  Plus,
  PlusCircle,
  Truck,
  Search,
  Calendar,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';
import { GiftProduct, ProductCategory, QuoteCalculatedItem, Order } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PRODUCT_CATEGORIES_INFO } from '../data/mockData';
import { VietQrModal } from './VietQrModal';
import { DeliveryReceiptModal } from './DeliveryReceiptModal';

interface QuoteCalculatorViewProps {
  products: GiftProduct[];
  onCreateOrderFromQuote: (quoteData: any) => void;
}

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

  // Multi-Item Quote List state
  const [quoteItems, setQuoteItems] = useState<QuoteCalculatedItem[]>([
    {
      id: 'q-item-1',
      productId: 'prod-cn-1',
      productName: 'Ly Trắng Thường',
      sku: 'LYSU-TRANG-TRON-350',
      category: 'ly_su',
      serviceGroup: 'chuyen_nhiet',
      unit: 'Chiếc',
      basePrice: 18000,
      quantity: 50,
      technique: 'chuyen_nhiet',
      positionsCount: 1,
      packaging: 'khong_hop',
      personalizeCount: 0,
      unitPrintCost: 15000,
      finalUnitPrice: 33000,
      totalPrice: 1650000,
      descriptionSummary: 'In chuyển nhiệt tiêu chuẩn',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 'q-item-2',
      productId: 'prod-cn-3',
      productName: 'Móc Khóa Mica',
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

  // Cột bên phải: Thông tin khách hàng (KHÔNG điền nội dung mặc định)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Hạn giao hàng (mặc định 2 ngày sau)
  const [deadlineDate, setDeadlineDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Vận Chuyển: Mặc định 'nhan_tai_shop', lựa chọn 'giao_hang_tai_nha' có ô nhập Phí Ship
  const [shippingMethod, setShippingMethod] = useState<'nhan_tai_shop' | 'giao_hang_tai_nha'>('nhan_tai_shop');
  const [shippingFee, setShippingFee] = useState<number>(0);

  // Tiền đặt cọc: Có thể chỉnh sửa bằng tay
  const [customDeposit, setCustomDeposit] = useState<string>('0');

  // Modifiers
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);
  const [includeVAT, setIncludeVAT] = useState<boolean>(false);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  // Modals
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showPrintA5Modal, setShowPrintA5Modal] = useState<boolean>(false);

  // Handler: Thêm sản phẩm từ cột bên trái vào bảng báo giá
  const handleAddProductToQuote = (prod: GiftProduct) => {
    const existingIndex = quoteItems.findIndex((item) => item.productId === prod.id);
    if (existingIndex > -1) {
      // Tăng số lượng nếu sản phẩm đã có trong danh sách
      setQuoteItems((prev) =>
        prev.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.quantity + 1;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.finalUnitPrice,
            };
          }
          return item;
        })
      );
    } else {
      // Đơn giá ban đầu = Giá phôi + phí in ước tính
      const defaultPrint = prod.serviceGroup === 'chuyen_nhiet' ? 12000 : prod.category === 'in_nhan_vo' ? 10000 : 8000;
      const initialPrice = prod.basePrice + defaultPrint;
      const newItem: QuoteCalculatedItem = {
        id: `q-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        category: prod.category,
        serviceGroup: prod.serviceGroup,
        unit: prod.unit || 'Chiếc',
        basePrice: prod.basePrice,
        quantity: 1,
        technique: prod.compatibleTechniques?.[0] || 'chuyen_nhiet',
        positionsCount: 1,
        packaging: 'khong_hop',
        personalizeCount: 0,
        unitPrintCost: defaultPrint,
        finalUnitPrice: initialPrice,
        totalPrice: initialPrice * 1,
        descriptionSummary: 'In tiêu chuẩn',
        imageUrl: prod.imageUrl,
      };
      setQuoteItems((prev) => [...prev, newItem]);
    }
  };

  // Handler: Cập nhật Số Lượng (SL) của sản phẩm trong báo giá (chỉnh sửa trực tiếp)
  const handleUpdateItemQuantity = (id: string, newQty: number) => {
    const q = Math.max(1, newQty || 1);
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: q,
              totalPrice: q * item.finalUnitPrice,
            }
          : item
      )
    );
  };

  // Handler: Cập nhật Đơn Giá (Giá) của sản phẩm trong báo giá (chỉnh sửa trực tiếp)
  const handleUpdateItemPrice = (id: string, newPrice: number) => {
    const p = Math.max(0, newPrice || 0);
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              finalUnitPrice: p,
              totalPrice: item.quantity * p,
            }
          : item
      )
    );
  };

  // Handler: Xóa sản phẩm khỏi bảng báo giá
  const handleRemoveQuoteItem = (itemId: string) => {
    setQuoteItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Phí ship có hiệu lực theo phương thức vận chuyển
  const effectiveShippingFee = shippingMethod === 'giao_hang_tai_nha' ? (shippingFee || 0) : 0;

  // Multi-Item Overall Calculations
  const overallCalculations = useMemo(() => {
    const totalItemsCount = quoteItems.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = quoteItems.reduce((sum, i) => sum + (i.quantity * i.finalUnitPrice), 0);

    const discountAmount = (subtotal * overallDiscountPercent) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;

    const urgentFee = isUrgent ? subtotalAfterDiscount * 0.2 : 0;
    const vatAmount = includeVAT ? (subtotalAfterDiscount + urgentFee) * 0.08 : 0;

    const grandTotal = subtotalAfterDiscount + urgentFee + vatAmount + effectiveShippingFee;
    const depositAmount50 = Math.round(grandTotal * 0.5);

    const parsedDeposit = customDeposit !== '' ? Math.max(0, Number(customDeposit)) : 0;
    const deposit = isNaN(parsedDeposit) ? 0 : parsedDeposit;
    const remainingCOD = Math.max(0, grandTotal - deposit);

    return {
      totalItemsCount,
      subtotal,
      discountAmount,
      urgentFee,
      vatAmount,
      shippingFee: effectiveShippingFee,
      grandTotal,
      depositAmount50,
      deposit,
      remainingCOD,
    };
  }, [quoteItems, overallDiscountPercent, isUrgent, includeVAT, effectiveShippingFee, customDeposit]);

  // Total goods value before adding shipping
  const totalGoodsAmount = overallCalculations.grandTotal - effectiveShippingFee;

  // Convert current quote state into an Order object for instant A5 printing & receipt generation
  const quoteAsOrder: Order = useMemo(() => {
    return {
      id: `quote-${Date.now()}`,
      orderCode: `BG-2608-${Math.floor(10 + Math.random() * 90)}`,
      customerName: customerName.trim() || 'Khách hàng Báo giá',
      customerPhone: customerPhone.trim() || '---',
      customerCompany: customerName.trim() || 'Khách đặt in ấn quà tặng',
      serviceGroup: quoteItems[0]?.serviceGroup || 'chuyen_nhiet',
      status: 'dang_thiet_ke',
      priority: isUrgent ? 'hoa_toc' : 'binh_thuong',
      paymentStatus: overallCalculations.deposit >= overallCalculations.grandTotal && overallCalculations.grandTotal > 0
        ? 'da_tat_toan'
        : overallCalculations.deposit > 0
        ? 'da_coc_50'
        : 'chua_coc',
      totalAmount: totalGoodsAmount,
      depositAmount: overallCalculations.deposit,
      shippingFeeCollected: effectiveShippingFee,
      createdAt: new Date().toISOString(),
      deadline: deadlineDate ? `${deadlineDate}T18:00:00.000Z` : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      shippingAddress: shippingMethod === 'nhan_tai_shop'
        ? 'Nhận trực tiếp tại Shop / Xưởng in'
        : (customerAddress.trim() || 'Giao hàng tận nơi'),
      productionNotes: `Báo giá ${quoteItems.length} món. ${shippingMethod === 'nhan_tai_shop' ? 'Nhận tại Shop. ' : `Giao tận nơi (Ship: ${formatCurrency(effectiveShippingFee)}). `}${customerAddress.trim() ? `Đ/C: ${customerAddress.trim()}. ` : ''}${includeVAT ? 'VAT (8%). ' : ''}${overallDiscountPercent > 0 ? `Chiết khấu ${overallDiscountPercent}%. ` : ''}${isUrgent ? 'In hỏa tốc (+20%).' : ''}`,
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
  }, [quoteItems, customerName, customerPhone, customerAddress, shippingMethod, effectiveShippingFee, isUrgent, includeVAT, overallDiscountPercent, overallCalculations, totalGoodsAmount, deadlineDate]);

  // Handler: Xác nhận tạo đơn hàng và chuyển thẳng sang Kanban
  const handleConfirmAndCreateOrder = () => {
    const now = new Date();
    const dayStr = String(now.getDate()).padStart(2, '0');
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const orderCode = `GIFT-${dayStr}${monthStr}-${randomSuffix}`;

    const createdOrder: Order = {
      id: `order-${Date.now()}`,
      orderCode,
      customerName: customerName.trim() || 'Khách hàng Báo giá',
      customerPhone: customerPhone.trim() || '---',
      customerCompany: customerName.trim() || 'Khách đặt qua Báo giá',
      serviceGroup: quoteItems[0]?.serviceGroup || 'chuyen_nhiet',
      status: 'dang_thiet_ke', // Chuyển thẳng sang cột 1 trên Kanban
      priority: isUrgent ? 'hoa_toc' : 'binh_thuong',
      paymentStatus: overallCalculations.deposit >= overallCalculations.grandTotal && overallCalculations.grandTotal > 0
        ? 'da_tat_toan'
        : overallCalculations.deposit > 0
        ? 'da_coc_50'
        : 'chua_coc',
      totalAmount: totalGoodsAmount,
      depositAmount: overallCalculations.deposit,
      shippingFeeCollected: effectiveShippingFee,
      createdAt: now.toISOString(),
      deadline: deadlineDate ? `${deadlineDate}T18:00:00.000Z` : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      shippingAddress: shippingMethod === 'nhan_tai_shop'
        ? 'Nhận trực tiếp tại Shop / Xưởng in'
        : (customerAddress.trim() || 'Giao hàng tận nơi'),
      shippingInfo: {
        carrier: shippingMethod === 'nhan_tai_shop' ? 'nhan_tai_shop' : 'ahamove',
        status: 'cho_dong_goi',
        shippingFee: effectiveShippingFee,
        codAmount: overallCalculations.remainingCOD,
        isCodCollected: false,
        notes: customerAddress.trim() || '',
      },
      productionNotes: `Đơn tạo từ Báo giá (${quoteItems.length} món). ${shippingMethod === 'nhan_tai_shop' ? 'Nhận tại Shop. ' : `Giao tận nơi (Ship: ${formatCurrency(effectiveShippingFee)}). `}${customerAddress.trim() ? `Đ/C: ${customerAddress.trim()}. ` : ''}${includeVAT ? 'VAT 8%. ' : ''}${overallDiscountPercent > 0 ? `Chiết khấu ${overallDiscountPercent}%. ` : ''}${isUrgent ? 'Hỏa tốc (+20%). ' : ''}`,
      items: quoteItems.map((item, idx) => {
        const prod = products.find((p) => p.id === item.productId);
        return {
          id: `item-${Date.now()}-${idx + 1}`,
          productName: item.productName,
          sku: item.sku,
          category: item.category,
          serviceGroup: item.serviceGroup,
          quantity: item.quantity,
          unitPrice: item.finalUnitPrice,
          printPricePerUnit: item.unitPrintCost,
          heatPressSpecs: prod?.heatPressSpecs,
          photoPrintSpecs: prod?.photoPrintSpecs,
          printPositions: [
            {
              id: `pos-${Date.now()}-${idx + 1}`,
              name: item.descriptionSummary || 'Vị trí in tiêu chuẩn',
              dimensions: 'Khổ in tiêu chuẩn theo phôi',
              colors: 'In 4-6 màu sắc nét',
              technique: item.technique || 'chuyen_nhiet',
            },
          ],
          mockupUrl: item.imageUrl || prod?.imageUrl || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
          proofApproved: false,
          notes: item.descriptionSummary || '',
        };
      }),
    };

    setShowConfirmOrderModal(false);
    onCreateOrderFromQuote(createdOrder);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-rose-500" /> Báo Giá In Ấn Quà Tặng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chọn sản phẩm, chỉnh sửa Số Lượng (SL) và Giá trực tiếp trên từng món, tính cọc linh hoạt & xuất phiếu báo giá A5.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ================= CỘT BÊN TRÁI: CHỌN SẢN PHẨM ================= */}
        <div className="lg:col-span-5 flex flex-col h-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-500" /> Chọn Sản Phẩm
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {filteredProducts.length} sản phẩm
            </span>
          </div>

          {/* Ô Tìm kiếm sản phẩm ở Cột Trái */}
          <div className="mt-3 relative">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm theo tên, mã..."
              className="w-full px-3 py-2 pl-8.5 text-xs bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            {productSearch && (
              <button
                type="button"
                onClick={() => setProductSearch('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Danh sách sản phẩm: Tên sản phẩm + Giá (Tự động co giãn theo chiều cao cột phải) */}
          <div className="mt-3 space-y-2 flex-1 overflow-y-auto pr-1 min-h-[360px] max-h-[600px]">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                Không tìm thấy sản phẩm phù hợp
              </div>
            ) : (
              filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleAddProductToQuote(prod)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 bg-white dark:bg-slate-900 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  title="Nhấn để thêm vào báo giá"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-600 transition-colors">
                        {prod.name}
                      </p>
                      <p className="text-[11px] font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                        Giá: {formatCurrency(prod.basePrice)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddProductToQuote(prod);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0 cursor-pointer shadow-2xs"
                    title="Thêm món"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= CỘT BÊN PHẢI: BẢNG BÁO GIÁ & THANH TOÁN ================= */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-rose-500/40 dark:border-rose-600/40 shadow-xl shadow-rose-500/5 flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-500" /> Bảng Báo Giá Chi Tiết
              </h3>
              <span className="bg-rose-500 text-white text-[10.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {quoteItems.length} Món
              </span>
            </div>

            {/* 1. THÔNG TIN KHÁCH HÀNG & HẠN GIAO */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Thông Tin Khách Hàng:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tên khách hàng / Công ty..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Số điện thoại..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-mono font-medium text-xs"
                  />
                </div>
                <div className="sm:col-span-4">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 focus-within:border-rose-500 transition-colors h-[34px]" title="Chọn ngày hẹn giao hàng cho khách">
                    <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Hạn Giao:</span>
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      className="w-full bg-transparent text-slate-900 dark:text-white font-medium text-xs outline-none cursor-pointer p-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. VẬN CHUYỂN */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> Vận Chuyển:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className={shippingMethod === 'giao_hang_tai_nha' ? 'sm:col-span-7' : 'sm:col-span-12'}>
                  <select
                    value={shippingMethod}
                    onChange={(e) => {
                      const method = e.target.value as 'nhan_tai_shop' | 'giao_hang_tai_nha';
                      setShippingMethod(method);
                      if (method === 'nhan_tai_shop') {
                        setShippingFee(0);
                      } else if (shippingFee === 0) {
                        setShippingFee(30000);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="nhan_tai_shop">- Nhận tại Shop (0₫)</option>
                    <option value="giao_hang_tai_nha">Giao hàng tại nhà</option>
                  </select>
                </div>

                {shippingMethod === 'giao_hang_tai_nha' && (
                  <div className="sm:col-span-5 relative">
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={shippingFee || ''}
                      onChange={(e) => setShippingFee(Math.max(0, Number(e.target.value)))}
                      placeholder="Phí Ship (đ)..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-mono font-bold outline-none focus:border-blue-500 pr-7 text-right"
                    />
                    <span className="absolute right-2.5 top-2 text-[11px] font-bold text-slate-400">
                      đ
                    </span>
                  </div>
                )}
              </div>

              {shippingMethod === 'giao_hang_tai_nha' && (
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Địa chỉ giao hàng (Số nhà, đường, quận/huyện...)..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 text-[11px]"
                />
              )}
            </div>

            {/* 3. THÔNG TIN SẢN PHẨM: GIÁ X SỐ LƯỢNG GỌN GÀNG ĐƠN GIẢN */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-rose-500" /> Thông Tin Sản Phẩm:
                </label>
                <span className="text-[10.5px] text-slate-400">
                  (Giá x Số lượng)
                </span>
              </div>

              {/* Danh sách các sản phẩm trong báo giá (CÙNG HÀNG TINH GỌN) */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 flex-1">
                {quoteItems.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    <Package className="w-7 h-7 mx-auto mb-1.5 opacity-30" />
                    Chưa có sản phẩm nào. Chọn sản phẩm bên trái để thêm vào báo giá.
                  </div>
                ) : (
                  quoteItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-colors flex items-center justify-between gap-1.5 sm:gap-2"
                    >
                      {/* Cột 1: STT & Tên sản phẩm rút gọn */}
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate" title={item.productName}>
                          {item.productName}
                        </p>
                      </div>

                      {/* Cột 2: Đơn giá x Số lượng = Thành tiền + Nút xóa (Cùng hàng) */}
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        {/* Ô Giá */}
                        <div className="relative w-20 sm:w-24">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={item.finalUnitPrice}
                            onChange={(e) => handleUpdateItemPrice(item.id, Number(e.target.value))}
                            placeholder="Giá..."
                            className="w-full px-2 py-1 text-right bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-mono font-bold text-xs outline-none focus:border-rose-500 pr-4"
                          />
                          <span className="absolute right-1.5 top-1 text-[10px] text-slate-400 font-medium">
                            đ
                          </span>
                        </div>

                        {/* Dấu nhân x */}
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-bold px-0.5">
                          x
                        </span>

                        {/* Ô Số lượng */}
                        <div className="w-12 sm:w-14">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQuantity(item.id, Number(e.target.value))}
                            className="w-full px-1 py-1 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-mono font-bold text-xs outline-none focus:border-rose-500"
                          />
                        </div>

                        {/* Thành tiền */}
                        <div className="text-right min-w-[70px] sm:min-w-[85px] pl-0.5 sm:pl-1">
                          <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400 whitespace-nowrap">
                            = {formatCurrency(item.quantity * item.finalUnitPrice)}
                          </span>
                        </div>

                        {/* Nút xóa */}
                        <button
                          type="button"
                          onClick={() => handleRemoveQuoteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shrink-0 cursor-pointer"
                          title="Xóa món"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. CHIẾT KHẤU & TIỀN CỌC (ĐƠN GIẢN HÓA, THU GỌN VÀO CÙNG MỘT KHỐI) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2.5">
              <div className="grid grid-cols-2 gap-3 items-center">
                {/* Chiết khấu */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chiết khấu (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overallDiscountPercent || ''}
                    onChange={(e) => setOverallDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-mono font-bold"
                  />
                </div>

                {/* Tiền cọc */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tiền cọc (đ):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={customDeposit}
                      onChange={(e) => setCustomDeposit(e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-mono font-bold pr-5"
                    />
                    <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-medium">
                      đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Tùy chọn VAT & Hỏa Tốc */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[11px] text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeVAT}
                    onChange={(e) => setIncludeVAT(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-500"
                  />
                  <span>VAT 8%</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[11px] text-amber-600 dark:text-amber-400">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Hỏa tốc (+20%)</span>
                </label>
              </div>

              {/* 5. TỔNG KẾT & THANH TOÁN */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
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
                    <span>Phí vận chuyển:</span>
                    <span>+ {formatCurrency(overallCalculations.shippingFee)}</span>
                  </div>
                )}

                {/* DÒNG TỔNG THANH TOÁN */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    TỔNG THANH TOÁN:
                  </span>
                  <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                    {formatCurrency(overallCalculations.grandTotal)}
                  </span>
                </div>

                {overallCalculations.deposit > 0 && (
                  <div className="flex justify-between text-xs pt-1 text-slate-500 dark:text-slate-400">
                    <span>Đã cọc: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(overallCalculations.deposit)}</strong></span>
                    <span>Còn lại (COD): <strong className="text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(overallCalculations.remainingCOD)}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* NÚT THAO TÁC */}
            <div className="pt-2 space-y-2 mt-auto">
              <button
                disabled={quoteItems.length === 0}
                onClick={() => setShowConfirmOrderModal(true)}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> ⚡ Tạo Đơn Hàng Từ Báo Giá Ngay
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={quoteItems.length === 0 || overallCalculations.deposit === 0}
                  onClick={() => setShowQrModal(true)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-600" /> Sinh VietQR Cọc
                </button>

                <button
                  disabled={quoteItems.length === 0}
                  onClick={() => setShowPrintA5Modal(true)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Xuất phiếu báo giá in ấn khổ A5 chuẩn đẹp kèm mã QR đặt cọc"
                >
                  <Printer className="w-3.5 h-3.5 text-rose-500" /> In Báo Giá A5
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP XÁC NHẬN TẠO ĐƠN HÀNG TỪ BÁO GIÁ */}
      {showConfirmOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Xác Nhận Tạo Đơn Hàng Sản Xuất
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Đơn hàng sẽ được tạo và chuyển trực tiếp sang bảng điều độ Kanban
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmOrderModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto custom-scrollbar flex-1 text-xs">
              {/* Thông tin khách hàng & Hạn giao */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10.5px] font-semibold text-slate-400 block uppercase">Khách hàng</span>
                  <span className="font-bold text-slate-900 dark:text-white">{customerName.trim() || 'Khách lẻ'}</span>
                  <span className="text-slate-500 block text-[11px] font-mono mt-0.5">{customerPhone.trim() || 'Chưa có SĐT'}</span>
                </div>
                <div>
                  <span className="text-[10.5px] font-semibold text-slate-400 block uppercase">Hạn giao hàng</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {deadlineDate ? formatDate(deadlineDate) : '2-3 ngày'}
                  </span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    {shippingMethod === 'nhan_tai_shop' ? 'Nhận tại Shop (0₫)' : `Giao tận nơi (+${formatCurrency(effectiveShippingFee)})`}
                  </span>
                </div>
              </div>

              {/* Danh sách món */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  <span>Sản phẩm ({quoteItems.length} món)</span>
                  <span>Thành tiền</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {quoteItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-slate-900 dark:text-white">{item.productName}</span>
                          <span className="text-slate-400 text-[11px] block">
                            {formatCurrency(item.finalUnitPrice)} × {item.quantity} {item.unit || 'món'}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 pl-2">
                        {formatCurrency(item.quantity * item.finalUnitPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng kết tiền */}
              <div className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tổng tiền hàng ({overallCalculations.totalItemsCount} sp):</span>
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
                    <span>Phí hỏa tốc (+20%):</span>
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
                  <div className="flex justify-between text-blue-600 dark:text-blue-400">
                    <span>Phí vận chuyển:</span>
                    <span>+ {formatCurrency(overallCalculations.shippingFee)}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-rose-200/80 dark:border-rose-900/60 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 dark:text-white uppercase">Tổng thanh toán:</span>
                  <span className="font-mono font-black text-sm text-rose-600 dark:text-rose-400">
                    {formatCurrency(overallCalculations.grandTotal)}
                  </span>
                </div>
                {overallCalculations.deposit > 0 ? (
                  <div className="flex justify-between text-[11px] pt-1 text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>Đã cọc: <strong className="text-slate-900 dark:text-white">{formatCurrency(overallCalculations.deposit)}</strong></span>
                    <span>Còn lại thu COD: <strong className="text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(overallCalculations.remainingCOD)}</strong></span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 pt-0.5">
                    Chưa cọc (Thu 100% COD khi giao hàng)
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmOrderModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Hủy / Chỉnh sửa lại
              </button>
              <button
                type="button"
                onClick={handleConfirmAndCreateOrder}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-500/20 flex items-center gap-1.5 active:scale-98 transition-all cursor-pointer"
              >
                <span>Xác Nhận Tạo Đơn & Chuyển Sang Kanban</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant A5 Quotation Print Modal */}
      {showPrintA5Modal && quoteAsOrder && (
        <DeliveryReceiptModal
          order={quoteAsOrder}
          initialPaperSize="A5"
          initialReceiptTitle="BẢNG BÁO GIÁ SẢN PHẨM"
          modalTitle="Xuất Báo Giá In Ấn"
          initialShippingFee={effectiveShippingFee}
          onClose={() => setShowPrintA5Modal(false)}
        />
      )}

      {showQrModal && overallCalculations.deposit > 0 && (
        <VietQrModal
          customAmount={overallCalculations.deposit}
          customOrderCode={`BAOGIA-${Date.now().toString().slice(-4)}`}
          customCustomerName={customerName.trim() || 'Khach Hang'}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
