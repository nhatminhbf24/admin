import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Printer,
  Calendar,
  Building2,
  Phone,
  MapPin,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  QrCode,
  Flame,
  Camera,
  Users,
  Truck,
  Copy,
  Check,
  Archive,
  Edit3,
  CreditCard,
  FileEdit,
  Save,
  CheckCircle2,
  Percent,
  Calculator,
  DollarSign,
  Package,
  Gift,
} from 'lucide-react';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  DefectLog,
  ShippingCarrier,
  ShippingTrackingInfo,
  ShippingStatus,
  PriorityLevel,
} from '../types';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getOrderStatusInfo,
  getPriorityInfo,
  getPaymentStatusInfo,
  getCarrierInfo,
  getShippingStatusInfo,
} from '../utils/formatters';
import { VietQrModal } from './VietQrModal';

interface OrderDetailsModalProps {
  order: Order | null;
  defectLogs?: DefectLog[];
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePayment: (orderId: string, payment: PaymentStatus, depositAmount?: number) => void;
  onUpdateNotes?: (orderId: string, productionNotes: string) => void;
  onUpdateCustomerInfo?: (
    orderId: string,
    customerData: {
      customerName?: string;
      customerPhone?: string;
      shippingAddress?: string;
    }
  ) => void;
  onUpdatePricing?: (
    orderId: string,
    pricingData: {
      totalAmount: number;
      discountPercent?: number;
      discountAmount?: number;
      includeVAT?: boolean;
      vatAmount?: number;
      urgentFee?: number;
      priority?: PriorityLevel;
      shippingFeeCollected?: number;
    }
  ) => void;
  onUpdateProofDesign?: (orderId: string, proof: any) => void;
  onUpdateShippingInfo?: (orderId: string, shipping: Partial<ShippingTrackingInfo>) => void;
  onOpenJobTicket: (order: Order) => void;
  onOpenDeliveryReceipt?: (order: Order) => void;
  onOpenDefectModal?: (orderId: string, productSku?: string) => void;
  onArchiveOrder?: (orderId: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  defectLogs = [],
  onClose,
  onUpdateStatus,
  onUpdatePayment,
  onUpdateNotes,
  onUpdateCustomerInfo,
  onUpdatePricing,
  onUpdateShippingInfo,
  onOpenJobTicket,
  onOpenDeliveryReceipt,
  onOpenDefectModal,
  onArchiveOrder,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Description / Notes state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [productionNotes, setProductionNotes] = useState(order?.productionNotes || '');
  const [savedNotesAlert, setSavedNotesAlert] = useState(false);

  // Helper to detect if an item needs gift wrap / gift packaging
  const checkNeedsGiftWrap = (it: { productName?: string; notes?: string; [key: string]: any }): boolean => {
    const text = `${it.productName || ''} ${it.notes || ''} ${it.packaging || ''} ${it.descriptionSummary || ''} ${(it.customNames || []).join(' ')}`.toLowerCase();
    return (
      text.includes('gói quà') ||
      text.includes('goi qua') ||
      text.includes('hộp quà') ||
      text.includes('hop qua') ||
      text.includes('gói giấy') ||
      text.includes('goi giay') ||
      text.includes('hộp đựng') ||
      text.includes('hop dung') ||
      text.includes('quà tặng') ||
      text.includes('gift') ||
      it.hasGiftWrap === true ||
      it.needsGiftWrap === true
    );
  };

  // 1. CUSTOMER INFO STATE
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerName, setCustomerName] = useState(order?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone || '');
  const [shippingAddress, setShippingAddress] = useState(order?.shippingAddress || '');

  // 2. DISCOUNT & PRICING MODIFIERS STATE (Đồng bộ với Báo Giá In Ấn Quà Tặng)
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(order?.discountPercent || 0);
  const [includeVAT, setIncludeVAT] = useState<boolean>(order?.includeVAT || false);
  const [isUrgent, setIsUrgent] = useState<boolean>(order?.priority === 'hoa_toc');

  // 3. PAYMENT & DEPOSIT STATE
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>(order?.paymentStatus || 'chua_coc');
  const [editDepositAmount, setEditDepositAmount] = useState<number>(order?.depositAmount ?? 0);

  // 4. SHIPPING STATE (Default carrier: 'khach_lay_tai_xuong' - Khách Nhận Tại Xưởng)
  const [editingShipping, setEditingShipping] = useState(false);
  const [shippingCarrier, setShippingCarrier] = useState<ShippingCarrier>(
    order?.shippingInfo?.carrier || 'khach_lay_tai_xuong'
  );
  const [trackingCode, setTrackingCode] = useState(order?.shippingInfo?.trackingCode || '');
  const [shippingFee, setShippingFee] = useState<number>(
    order?.shippingInfo?.shippingFee !== undefined
      ? order.shippingInfo.shippingFee
      : (order?.shippingFeeCollected || 0)
  );
  const [shippingNotes, setShippingNotes] = useState(order?.shippingInfo?.notes || '');
  const [isCodCollected, setIsCodCollected] = useState<boolean>(order?.shippingInfo?.isCodCollected || false);

  // Synchronize internal state whenever active order changes
  useEffect(() => {
    if (order) {
      setProductionNotes(order.productionNotes || '');
      setCustomerName(order.customerName || '');
      setCustomerPhone(order.customerPhone || '');
      setShippingAddress(order.shippingAddress || '');
      setDiscountPercent(order.discountPercent || 0);
      setIncludeVAT(order.includeVAT || false);
      setIsUrgent(order.priority === 'hoa_toc');
      setEditPaymentStatus(order.paymentStatus || 'chua_coc');
      setEditDepositAmount(order.depositAmount ?? 0);
      setShippingCarrier(order.shippingInfo?.carrier || 'khach_lay_tai_xuong');
      setTrackingCode(order.shippingInfo?.trackingCode || '');
      setShippingFee(
        order.shippingInfo?.shippingFee !== undefined
          ? order.shippingInfo.shippingFee
          : (order.shippingFeeCollected || 0)
      );
      setShippingNotes(order.shippingInfo?.notes || '');
      setIsCodCollected(order.shippingInfo?.isCodCollected || false);
    }
  }, [order?.id]);

  if (!order) return null;

  const statusInfo = getOrderStatusInfo(order.status);
  const priorityInfo = getPriorityInfo(order.priority);
  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
  const carrierInfo = getCarrierInfo(order.shippingInfo?.carrier || 'khach_lay_tai_xuong');
  const shippingStatusInfo = getShippingStatusInfo(order.shippingInfo?.status || 'cho_dong_goi');

  const STAGES: { status: OrderStatus; label: string }[] = [
    { status: 'dang_thiet_ke', label: '1. Đang Thiết Kế' },
    { status: 'da_in_cho_ep', label: '2. Đã In Chờ Ép' },
    { status: 'da_ep_cho_giao', label: '3. Đã Ép Chờ Giao' },
    { status: 'dang_giao', label: '4. Đang Giao' },
    { status: 'hoan_tat', label: '5. Hoàn Tất' },
  ];

  // Filter defects for this order
  const orderDefects = defectLogs.filter((d) => d.orderId === order.id || d.orderCode === order.orderCode);

  // Total items quantity and raw goods subtotal
  const totalItemsCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
  const rawGoodsSubtotal = order.items.reduce(
    (sum, it) => sum + (it.unitPrice + it.printPricePerUnit) * it.quantity,
    0
  );

  // Pricing calculations synchronized with Quote Calculator
  const pricingCalculations = useMemo(() => {
    const subtotal = rawGoodsSubtotal > 0 ? rawGoodsSubtotal : order.totalAmount;
    const discountAmount = (subtotal * discountPercent) / 100;
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
  }, [rawGoodsSubtotal, order.totalAmount, totalItemsCount, discountPercent, isUrgent, includeVAT, shippingFee]);

  const remainingBalance = Math.max(0, pricingCalculations.grandTotal - (order.depositAmount || 0));

  const handleCopyAddress = () => {
    const fullText = `${order.customerName} - ${order.customerPhone}\n${order.shippingAddress}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(order.customerPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyTracking = () => {
    if (order.shippingInfo?.trackingCode) {
      navigator.clipboard.writeText(order.shippingInfo.trackingCode);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(order.id, productionNotes);
    }
    setIsEditingNotes(false);
    setSavedNotesAlert(true);
    setTimeout(() => setSavedNotesAlert(false), 2000);
  };

  // Handler: Save Customer Info
  const handleSaveCustomer = () => {
    if (onUpdateCustomerInfo) {
      onUpdateCustomerInfo(order.id, {
        customerName: customerName.trim() || order.customerName,
        customerPhone: customerPhone.trim() || order.customerPhone,
        shippingAddress: shippingAddress.trim() || order.shippingAddress,
      });
    }
    setIsEditingCustomer(false);
  };

  // Handler: Save Pricing & Discount Modifiers & Deposit
  const handleSavePricing = () => {
    if (onUpdatePricing) {
      onUpdatePricing(order.id, {
        totalAmount: pricingCalculations.grandTotal,
        discountPercent,
        discountAmount: pricingCalculations.discountAmount,
        includeVAT,
        vatAmount: pricingCalculations.vatAmount,
        urgentFee: pricingCalculations.urgentFee,
        priority: isUrgent ? 'hoa_toc' : order.priority === 'hoa_toc' ? 'binh_thuong' : order.priority,
        shippingFeeCollected: shippingFee,
      });
    }

    let deposit = Number(editDepositAmount) || 0;
    if (editPaymentStatus === 'chua_coc') {
      deposit = 0;
    } else if (editPaymentStatus === 'da_tat_toan') {
      deposit = pricingCalculations.grandTotal;
    } else if (editPaymentStatus === 'da_coc_50' && deposit === 0) {
      deposit = pricingCalculations.depositAmount50;
    }

    onUpdatePayment(order.id, editPaymentStatus, deposit);
    setIsEditingPricing(false);
  };

  // Handler: Save Payment / Deposit
  const handleSavePayment = () => {
    let deposit = Number(editDepositAmount) || 0;
    if (editPaymentStatus === 'chua_coc') {
      deposit = 0;
    } else if (editPaymentStatus === 'da_tat_toan') {
      deposit = pricingCalculations.grandTotal;
    } else if (editPaymentStatus === 'da_coc_50' && deposit === 0) {
      deposit = pricingCalculations.depositAmount50;
    }

    onUpdatePayment(order.id, editPaymentStatus, deposit);
    setIsEditingPayment(false);
  };

  const handleQuickPaymentChange = (newPayment: PaymentStatus) => {
    let deposit = 0;
    if (newPayment === 'da_coc_50') {
      deposit = pricingCalculations.depositAmount50;
    } else if (newPayment === 'da_tat_toan') {
      deposit = pricingCalculations.grandTotal;
    }
    setEditPaymentStatus(newPayment);
    setEditDepositAmount(deposit);
    onUpdatePayment(order.id, newPayment, deposit);
  };

  // Handler: Save Shipping Info
  const handleSaveShipping = () => {
    if (onUpdateShippingInfo) {
      onUpdateShippingInfo(order.id, {
        carrier: shippingCarrier,
        trackingCode: shippingCarrier === 'shipper_xuong' ? '' : trackingCode.trim(),
        shippingFee: Number(shippingFee) || 0,
        codAmount: Math.max(0, pricingCalculations.grandTotal - (order.depositAmount || 0)),
        isCodCollected,
        notes: shippingNotes.trim(),
      });
      setEditingShipping(false);
    }
  };

  const handleShippingStatusChange = (newStatus: ShippingStatus) => {
    if (onUpdateShippingInfo) {
      onUpdateShippingInfo(order.id, {
        status: newStatus,
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
          
          {/* ================= STICKY ACTION HEADER ================= */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 backdrop-blur-md shrink-0">
            {/* Left: Code, Priority & Dates */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white font-mono truncate">
                    {order.orderCode}
                  </h3>
                  {order.priority === 'hoa_toc' && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                      HỎA TỐC
                    </span>
                  )}
                  {order.priority === 'gap' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
                      GẤP
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Tạo {formatDateTime(order.createdAt)} • Hạn giao <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formatDate(order.deadline)}</strong>
                </p>
              </div>
            </div>

            {/* Right: Unified Single Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenJobTicket(order);
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all border border-blue-200 dark:border-blue-800 cursor-pointer shadow-2xs"
                title="In Lệnh Sản Xuất Xưởng A4/A5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" /> In Lệnh Xưởng
              </button>

              {onOpenDeliveryReceipt && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeliveryReceipt(order);
                  }}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 hover:bg-rose-100 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all border border-rose-200 dark:border-rose-800 cursor-pointer shadow-2xs"
                  title="In phiếu giao hàng khổ A6 / A7"
                >
                  <Truck className="w-3.5 h-3.5 text-rose-600" /> Phiếu Giao
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all border border-indigo-200 dark:border-indigo-800 cursor-pointer shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-600" /> VietQR
              </button>

              {order.status === 'hoan_tat' && !order.isArchived && onArchiveOrder && (
                <button
                  type="button"
                  onClick={() => {
                    onArchiveOrder(order.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-2xs"
                  title="Lưu trữ đơn hàng vào lịch sử"
                >
                  <Archive className="w-3.5 h-3.5" /> Lưu Trữ
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ================= 2-COLUMN SPLIT VIEW BODY ================= */}
          <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* ================= COLUMN 1: MÔ TẢ & THÔNG SỐ SẢN PHẨM - 6 COLS ================= */}
              <div className="lg:col-span-6 space-y-4">
                
                {/* 1.1 MÔ TẢ & GHI CHÚ NỘI DUNG TỰ GHI */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/40 pb-2">
                    <div className="flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900 dark:text-white">
                        Mô Tả & Ghi Chú Đơn Hàng
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {savedNotesAlert && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingNotes) {
                            handleSaveNotes();
                          } else {
                            setIsEditingNotes(true);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                          isEditingNotes
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100/50'
                        }`}
                      >
                        {isEditingNotes ? (
                          <>
                            <Save className="w-3 h-3" /> Lưu mô tả
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-3 h-3" /> Chỉnh sửa
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 italic">
                    Nội dung để bạn tự ghi chú mọi yêu cầu kỹ thuật, lưu ý in ấn hoặc yêu cầu đặc biệt của đơn hàng.
                  </p>

                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={productionNotes}
                        onChange={(e) => setProductionNotes(e.target.value)}
                        placeholder="Nhập nội dung ghi chú tự do cho đơn hàng này (VD: Màu sắc yêu cầu, vị trí logo, dặn dò thợ ép hoặc lưu ý riêng của khách)..."
                        className="w-full p-2.5 text-xs rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProductionNotes(order.productionNotes || '');
                            setIsEditingNotes(false);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                        >
                          Lưu lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-amber-200/80 dark:border-amber-900/50 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap min-h-[60px] leading-relaxed">
                      {order.productionNotes || (
                        <span className="text-slate-400 italic">
                          Chưa có ghi chú mô tả nào. Bấm "Chỉnh sửa" ở trên để thêm ghi chú.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 1.2 PRODUCTION ITEMS & TECHNICAL PRINT SPECS */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" /> Chi Tiết Món Hàng & Thông Số Kỹ Thuật
                    </h4>
                    
                    {/* Compact Scrap / Defect Button */}
                    {onOpenDefectModal && (
                      <button
                        type="button"
                        onClick={() => onOpenDefectModal(order.id, order.items[0]?.sku)}
                        className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-900 cursor-pointer"
                        title="Báo in hỏng hoặc lỗi phôi để xưởng xuất bù"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-500" /> Báo Hỏng / In Lại
                      </button>
                    )}
                  </div>

                  {/* List of items */}
                  <div className="space-y-3">
                    {order.items.map((it, idx) => {
                      const needsGiftWrap = checkNeedsGiftWrap(it);
                      const unitTotal = it.unitPrice + it.printPricePerUnit;
                      const lineTotal = unitTotal * it.quantity;

                      return (
                        <div
                          key={it.id || idx}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/60 space-y-2"
                        >
                          <div className="flex gap-3 items-start">
                            {/* Product Mockup Image */}
                            <img
                              src={it.mockupUrl}
                              alt={it.productName}
                              className="w-14 h-14 rounded-lg object-cover bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[10.5px] flex items-center justify-center shrink-0 font-mono">
                                      {idx + 1}
                                    </span>
                                    <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                                      {it.productName}
                                    </h5>
                                    {needsGiftWrap && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-extrabold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-2xs">
                                        <Gift className="w-3 h-3 text-white" /> Cần Gói Quà
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span className="font-black text-xs font-mono text-rose-600 dark:text-rose-400 shrink-0 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-900">
                                  SL: {it.quantity} {it.category === 'in_nhan_vo' ? 'set' : 'cái'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                                <span>
                                  Đơn giá: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(unitTotal)}</strong>
                                </span>
                                <span>
                                  Thành tiền: <strong className="text-blue-600 dark:text-blue-400 font-mono font-bold">{formatCurrency(lineTotal)}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Machine / Press Specs */}
                          {it.heatPressSpecs ? (
                            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-between text-[11px]">
                              <span className="font-bold flex items-center gap-1">
                                <Flame className="w-3.5 h-3.5 text-amber-600" /> Ép nhiệt:
                              </span>
                              <span className="font-mono font-semibold">
                                {it.heatPressSpecs.temperatureC}°C • {it.heatPressSpecs.timeSeconds}s • {it.heatPressSpecs.recommendedMachine}
                              </span>
                            </div>
                          ) : it.photoPrintSpecs ? (
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 flex items-center justify-between text-[11px]">
                              <span className="font-bold flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5 text-blue-600" /> Cán màng / Giấy:
                              </span>
                              <span className="font-semibold">
                                {it.photoPrintSpecs.paperType} • {it.photoPrintSpecs.lamination}
                              </span>
                            </div>
                          ) : null}

                          {/* Custom Names list if available */}
                          {it.customNames && it.customNames.length > 0 && (
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                              <p className="font-bold text-[10.5px] text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <Users className="w-3 h-3 text-blue-600" /> Danh sách {it.customNames.length} tên riêng:
                              </p>
                              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                {it.customNames.map((nm, nIdx) => (
                                  <span
                                    key={nIdx}
                                    className="px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium"
                                  >
                                    {nm}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 1.3 DEFECT LOG BANNER (IF ANY) */}
                {orderDefects.length > 0 && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                    <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-bold text-xs">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Nhật ký đền phôi ({orderDefects.length} lần)
                      </span>
                      <span className="text-[10px] font-mono text-rose-600">
                        Xưởng bù: {formatCurrency(orderDefects.reduce((sum, d) => sum + d.estimatedCostLoss, 0))}
                      </span>
                    </div>
                    <div className="space-y-1 text-[10.5px]">
                      {orderDefects.map((def) => (
                        <div key={def.id} className="flex items-center justify-between bg-white dark:bg-slate-900/80 p-1.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                          <span className="text-slate-700 dark:text-slate-300">
                            <strong className="text-rose-600">-{def.quantityScrapped}</strong> {def.productName} ({def.customReasonNote || def.reason})
                          </span>
                          <span className="text-slate-400 text-[10px]">Thợ: {def.technicianName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= COLUMN 2: ĐỒNG BỘ BÁO GIÁ IN ẤN QUÀ TẶNG (6 COLS) ================= */}
              {/* Thứ tự tối ưu: TIẾN ĐỘ > KHÁCH HÀNG > CHIẾT KHẤU > CỌC > VẬN CHUYỂN */}
              <div className="lg:col-span-6 space-y-4">
                
                {/* 0. PRODUCTION STAGE STEPPER */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Công Đoạn Tiến Độ Sản Xuất
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                    {STAGES.map((st, idx) => {
                      const isCurrent = order.status === st.status;
                      const isPast = statusInfo.stepIndex > idx;
                      return (
                        <button
                          key={st.status}
                          type="button"
                          onClick={() => onUpdateStatus(order.id, st.status)}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] border transition-all text-center cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : isPast
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1. KHÁCH HÀNG (THÔNG TIN KHÁCH HÀNG / ĐƠN VỊ - ĐỒNG BỘ GIAO DIỆN BÁO GIÁ) */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wide text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-rose-500" /> 1. Thông Tin Khách Hàng / Đơn Vị
                    </h4>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                          copiedAddress
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                        }`}
                        title="Copy Tên, SĐT và Địa chỉ để dán vào App Giao Hàng"
                      >
                        {copiedAddress ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAddress ? 'Đã copy!' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingCustomer) {
                            handleSaveCustomer();
                          } else {
                            setIsEditingCustomer(true);
                          }
                        }}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> {isEditingCustomer ? 'Lưu' : 'Sửa'}
                      </button>
                    </div>
                  </div>

                  {isEditingCustomer ? (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                            Tên khách / Công ty:
                          </label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Tên khách / Công ty..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                            Số điện thoại:
                          </label>
                          <input
                            type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Số điện thoại..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Địa chỉ nhận hàng:
                        </label>
                        <input
                          type="text"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Địa chỉ giao hàng..."
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerName(order.customerName || '');
                            setCustomerPhone(order.customerPhone || '');
                            setShippingAddress(order.shippingAddress || '');
                            setIsEditingCustomer(false);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCustomer}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                        >
                          Lưu Thông Tin
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                          <span className="text-slate-400 text-[10.5px] block">Tên khách / Đơn vị:</span>
                          <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 truncate">
                            {order.customerName}
                          </p>
                        </div>

                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                          <span className="text-slate-400 text-[10.5px] block">Số điện thoại:</span>
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                              {order.customerPhone}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyPhone}
                              className="text-slate-400 hover:text-blue-600 p-0.5"
                              title="Copy SĐT"
                            >
                              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-slate-400 text-[10.5px] font-semibold flex items-center gap-1 mb-0.5">
                            <MapPin className="w-3 h-3 text-rose-500" /> Địa chỉ giao hàng:
                          </span>
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {order.shippingAddress || 'Nhận trực tiếp tại xưởng in'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. CHIẾT KHẤU & TỔNG THANH TOÁN (ĐỒNG BỘ TRỰC TIẾP TỪ BÁO GIÁ IN ẤN QUÀ TẶNG & TÍCH HỢP CỌC) */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-rose-500/40 dark:border-rose-600/40 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-rose-500" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900 dark:text-white">
                        2. Chiết Khấu & Tổng Thanh Toán
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isEditingPricing) {
                          handleSavePricing();
                        } else {
                          setIsEditingPricing(true);
                        }
                      }}
                      className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-lg font-bold text-[11px] border border-rose-200 dark:border-rose-900 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> {isEditingPricing ? 'Lưu thay đổi' : 'Sửa chiết khấu/cọc'}
                    </button>
                  </div>

                  {/* Chiết khấu, VAT & Hỏa tốc & Đặt cọc form khi chỉnh sửa */}
                  {isEditingPricing ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Chiết khấu tổng (%):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(Math.max(0, Math.min(50, Number(e.target.value))))}
                            className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-800 rounded-lg border border-rose-300 dark:border-rose-700 text-slate-900 dark:text-white font-bold"
                          />
                        </div>

                        <div className="flex flex-col justify-end space-y-1.5">
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={includeVAT}
                              onChange={(e) => setIncludeVAT(e.target.checked)}
                              className="rounded text-rose-500 focus:ring-rose-500"
                            />
                            <span>Xuất VAT 8%</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[11px] text-amber-600 dark:text-amber-400">
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

                      {/* Tiền đặt cọc & Trạng thái thanh toán khi sửa */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Tiền đặt cọc (VNĐ):
                          </label>
                          <input
                            type="number"
                            value={editDepositAmount}
                            onChange={(e) => setEditDepositAmount(Number(e.target.value))}
                            step={5000}
                            placeholder="Mặc định: 0 đ"
                            className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Trạng thái cọc:
                          </label>
                          <select
                            value={editPaymentStatus}
                            onChange={(e) => {
                              const newSt = e.target.value as PaymentStatus;
                              setEditPaymentStatus(newSt);
                              if (newSt === 'chua_coc') setEditDepositAmount(0);
                              else if (newSt === 'da_coc_50') setEditDepositAmount(pricingCalculations.depositAmount50);
                              else if (newSt === 'da_tat_toan') setEditDepositAmount(pricingCalculations.grandTotal);
                            }}
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                          >
                            <option value="chua_coc">Chưa cọc (0đ)</option>
                            <option value="da_coc_50">Đã cọc 50%</option>
                            <option value="da_tat_toan">Đã thanh toán đủ 100%</option>
                            <option value="cong_no">Công nợ</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Cost Breakdown synced from Quote Calculator */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <div className="flex justify-between">
                      <span>Tiền hàng ({pricingCalculations.totalItemsCount} sp):</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(pricingCalculations.subtotal)}
                      </span>
                    </div>

                    {pricingCalculations.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Chiết khấu ({discountPercent}%):</span>
                        <span>- {formatCurrency(pricingCalculations.discountAmount)}</span>
                      </div>
                    )}

                    {pricingCalculations.urgentFee > 0 && (
                      <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                        <span>Phí in hỏa tốc:</span>
                        <span>+ {formatCurrency(pricingCalculations.urgentFee)}</span>
                      </div>
                    )}

                    {pricingCalculations.vatAmount > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Thuế VAT (8%):</span>
                        <span>+ {formatCurrency(pricingCalculations.vatAmount)}</span>
                      </div>
                    )}

                    {pricingCalculations.shippingFee > 0 && (
                      <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
                        <span>Phí vận chuyển (Ship):</span>
                        <span>+ {formatCurrency(pricingCalculations.shippingFee)}</span>
                      </div>
                    )}

                    {/* BIG ROSE TOTAL LINE */}
                    <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        TỔNG THANH TOÁN BÁO GIÁ:
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                        {formatCurrency(pricingCalculations.grandTotal)}
                      </span>
                    </div>

                    {/* TIỀN ĐẶT CỌC & CÒN LẠI THU (COD) - TÍCH HỢP TRỰC TIẾP TRONG MỤC 2 */}
                    <div className="pt-2 mt-2 border-t border-dashed border-slate-200 dark:border-slate-700/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Tiền đặt cọc:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(order.depositAmount || 0)}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${paymentInfo.bg}`}>
                            {paymentInfo.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Còn lại cần thu (COD):
                        </span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(remainingBalance)}
                        </span>
                      </div>

                      {/* Quick Payment Status buttons */}
                      <div className="flex items-center justify-between gap-1 pt-1.5">
                        <span className="text-[10.5px] text-slate-400 font-medium">Chuyển nhanh cọc:</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickPaymentChange('chua_coc')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              order.paymentStatus === 'chua_coc'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            Chưa cọc (0đ)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickPaymentChange('da_coc_50')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              order.paymentStatus === 'da_coc_50'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            Cọc 50%
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickPaymentChange('da_tat_toan')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              order.paymentStatus === 'da_tat_toan'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            ✓ Đủ 100%
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. VẬN CHUYỂN & GIAO HÀNG (MẶC ĐỊNH KHÁCH NHẬN TẠI XƯỞNG) */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900 dark:text-white">
                        3. Vận Chuyển & Giao Hàng
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${shippingStatusInfo.badge}`}>
                        {shippingStatusInfo.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingShipping(!editingShipping)}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> {editingShipping ? 'Đóng form' : 'Sửa vận chuyển'}
                    </button>
                  </div>

                  {editingShipping ? (
                    /* Edit Form */
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Phương Thức Giao Hàng:
                          </label>
                          <select
                            value={shippingCarrier}
                            onChange={(e) => setShippingCarrier(e.target.value as ShippingCarrier)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                          >
                            <option value="khach_lay_tai_xuong">Khách Nhận Tại Xưởng (Mặc định)</option>
                            <option value="shipper_xuong">Shipper Xưởng</option>
                            <option value="ahamove">Ahamove (Giao nhanh)</option>
                            <option value="grab_express">GrabExpress</option>
                            <option value="viettel_post">ViettelPost</option>
                            <option value="ghtk">Giao Hàng Tiết Kiệm (GHTK)</option>
                          </select>
                        </div>

                        {shippingCarrier === 'shipper_xuong' ? (
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Giá Ship (VNĐ):
                            </label>
                            <input
                              type="number"
                              value={shippingFee}
                              onChange={(e) => setShippingFee(Number(e.target.value))}
                              step={5000}
                              placeholder="0 (Freeship) hoặc 20.000, 30.000..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                            />
                          </div>
                        ) : shippingCarrier === 'khach_lay_tai_xuong' ? (
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Ghi chú nhận xưởng:
                            </label>
                            <input
                              type="text"
                              value={shippingNotes}
                              onChange={(e) => setShippingNotes(e.target.value)}
                              placeholder="VD: Hẹn 15h ghé lấy..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Mã Vận Đơn / Tracking:
                            </label>
                            <input
                              type="text"
                              value={trackingCode}
                              onChange={(e) => setTrackingCode(e.target.value)}
                              placeholder="VD: AHA-982, VTP-129..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-bold">
                          <input
                            type="checkbox"
                            checked={isCodCollected}
                            onChange={(e) => setIsCodCollected(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>Đã thu tiền COD</span>
                        </label>

                        <button
                          type="button"
                          onClick={handleSaveShipping}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
                        >
                          Lưu Thông Tin
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Summary */
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <span className="text-slate-400 text-[10px] block">Phương thức giao:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5 block truncate">
                          {carrierInfo.label}
                        </span>
                      </div>

                      {/* If Khách Lấy Tại Xưởng -> Show Freeship / Lấy xưởng */}
                      {/* If Shipper Xưởng -> Show Giá Ship, Else -> Show Mã Tracking */}
                      <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        {(order.shippingInfo?.carrier || 'khach_lay_tai_xuong') === 'khach_lay_tai_xuong' ? (
                          <>
                            <span className="text-slate-400 text-[10px] block">Địa điểm:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs block mt-0.5">
                              Nhận tại xưởng in (0₫)
                            </span>
                          </>
                        ) : (order.shippingInfo?.carrier || 'khach_lay_tai_xuong') === 'shipper_xuong' ? (
                          <>
                            <span className="text-slate-400 text-[10px] block">Giá Ship:</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs block mt-0.5">
                              {(shippingFee || 0) > 0
                                ? formatCurrency(shippingFee)
                                : '0 ₫ (Freeship / Xưởng bao)'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400 text-[10px] block">Mã Tracking:</span>
                            <div className="flex items-center justify-between gap-1 mt-0.5">
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs truncate">
                                {order.shippingInfo?.trackingCode || 'Chưa có mã'}
                              </span>
                              {order.shippingInfo?.trackingCode && (
                                <button
                                  type="button"
                                  onClick={handleCopyTracking}
                                  className="text-slate-400 hover:text-blue-600"
                                  title="Copy mã vận đơn"
                                >
                                  {copiedTracking ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700 col-span-2 sm:col-span-1">
                        <span className="text-slate-400 text-[10px] block">Tiền thu COD:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5 block">
                          {formatCurrency(remainingBalance)}
                          {order.shippingInfo?.isCodCollected ? (
                            <span className="text-[10px] text-emerald-600 font-bold ml-1">✓ Đã thu</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-bold ml-1">⏳ Chưa</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* VietQR Payment Modal */}
      {showQrModal && (
        <VietQrModal
          order={order}
          onClose={() => setShowQrModal(false)}
          onConfirmPaymentSuccess={(orderId, newStatus) => {
            onUpdatePayment(orderId, newStatus);
            setShowQrModal(false);
          }}
        />
      )}
    </>
  );
};
