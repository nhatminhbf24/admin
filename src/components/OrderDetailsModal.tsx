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
  Sparkles,
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
  onUpdateNotes?: (orderId: string, productionNotes: string, updatedAt?: string) => void;
  onUpdateDeadline?: (orderId: string, deadline: string) => void;
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
  onUpdateDeadline,
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
  const [notesLastEdited, setNotesLastEdited] = useState<string | undefined>(
    order?.productionNotesUpdatedAt || (order?.productionNotes ? order.createdAt : undefined)
  );
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

  // Master Quote & Order Details Edit Mode State (Kanban Mode: defaults to clean read-only view)
  const [isEditingQuote, setIsEditingQuote] = useState(false);

  // 1. CUSTOMER INFO STATE
  const [customerName, setCustomerName] = useState(order?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone || '');
  const [shippingAddress, setShippingAddress] = useState(order?.shippingAddress || '');

  // 2. DISCOUNT & PRICING MODIFIERS STATE (Đồng bộ với Báo Giá In Ấn Quà Tặng)
  const [discountPercent, setDiscountPercent] = useState<number>(order?.discountPercent || 0);
  const [includeVAT, setIncludeVAT] = useState<boolean>(order?.includeVAT || false);
  const [isUrgent, setIsUrgent] = useState<boolean>(order?.priority === 'hoa_toc');

  // 3. PAYMENT & DEPOSIT STATE
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>(order?.paymentStatus || 'chua_coc');
  const [editDepositAmount, setEditDepositAmount] = useState<number>(order?.depositAmount ?? 0);

  // 4. SHIPPING STATE (Default carrier: 'khach_lay_tai_xuong' - Khách Nhận Tại Xưởng)
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

  // Helper to extract YYYY-MM-DD
  const getIsoDate = (dStr?: string) => {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      const match = dStr.match(/\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : '';
    } catch {
      return '';
    }
  };

  const [deadlineDate, setDeadlineDate] = useState(() => getIsoDate(order?.deadline));
  const [savedDeadlineAlert, setSavedDeadlineAlert] = useState(false);

  // Format last modified timestamp (e.g. 19:15:30 - 27/08/2026)
  const formatLastModified = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
  };

  // Synchronize internal state whenever active order changes
  useEffect(() => {
    if (order) {
      setIsEditingQuote(false);
      setDeadlineDate(getIsoDate(order.deadline));
      setProductionNotes(order.productionNotes || '');
      setNotesLastEdited(
        order.productionNotesUpdatedAt || (order.productionNotes ? order.createdAt : undefined)
      );
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
  }, [order?.id, order?.deadline]);

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDeadlineDate(newDate);
    if (!newDate || !order) return;

    let newDeadlineStr = newDate;
    if (order.deadline && order.deadline.includes('T')) {
      const timePart = order.deadline.split('T')[1];
      newDeadlineStr = `${newDate}T${timePart}`;
    }

    if (onUpdateDeadline) {
      onUpdateDeadline(order.id, newDeadlineStr);
      setSavedDeadlineAlert(true);
      setTimeout(() => setSavedDeadlineAlert(false), 2000);
    }
  };

  const [savedAllAlert, setSavedAllAlert] = useState(false);

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

  const remainingBalance = Math.max(0, pricingCalculations.grandTotal - (editDepositAmount || 0));

  const handleCopyAddress = () => {
    const fullText = `${customerName || order.customerName} - ${customerPhone || order.customerPhone}\n${shippingAddress || order.shippingAddress}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(customerPhone || order.customerPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyTracking = () => {
    if (trackingCode || order.shippingInfo?.trackingCode) {
      navigator.clipboard.writeText(trackingCode || order.shippingInfo?.trackingCode || '');
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleSaveNotes = (newText?: string) => {
    const textToSave = newText !== undefined ? newText : productionNotes;
    const isDifferent = textToSave.trim() !== (order.productionNotes || '').trim();
    let updatedTime = notesLastEdited;
    if (isDifferent) {
      updatedTime = new Date().toISOString();
      setNotesLastEdited(updatedTime);
    }
    if (onUpdateNotes) {
      onUpdateNotes(order.id, textToSave, updatedTime);
    }
    setSavedNotesAlert(true);
    setTimeout(() => setSavedNotesAlert(false), 2000);
  };

  // Unified Save for Quote & Order Details (Right Column)
  const handleSaveAllQuoteChanges = () => {
    // 1. Update Customer
    if (onUpdateCustomerInfo) {
      onUpdateCustomerInfo(order.id, {
        customerName: customerName.trim() || order.customerName,
        customerPhone: customerPhone.trim() || order.customerPhone,
        shippingAddress: shippingAddress.trim() || order.shippingAddress,
      });
    }

    // 2. Update Pricing
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

    // 3. Update Payment / Deposit
    let deposit = Number(editDepositAmount) || 0;
    let paymentSt: PaymentStatus = editPaymentStatus;
    if (deposit === 0) {
      paymentSt = 'chua_coc';
    } else if (deposit >= pricingCalculations.grandTotal && pricingCalculations.grandTotal > 0) {
      paymentSt = 'da_tat_toan';
    } else if (deposit > 0) {
      paymentSt = 'da_coc_50';
    }
    onUpdatePayment(order.id, paymentSt, deposit);

    // 4. Update Shipping
    if (onUpdateShippingInfo) {
      onUpdateShippingInfo(order.id, {
        carrier: shippingCarrier,
        trackingCode: shippingCarrier === 'khach_lay_tai_xuong' ? '' : trackingCode.trim(),
        shippingFee: Number(shippingFee) || 0,
        codAmount: Math.max(0, pricingCalculations.grandTotal - deposit),
        isCodCollected,
        notes: shippingNotes.trim(),
      });
    }

    setIsEditingQuote(false);
    setSavedAllAlert(true);
    setTimeout(() => setSavedAllAlert(false), 2500);
  };

  const handleCancelEditQuote = () => {
    if (order) {
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
    setIsEditingQuote(false);
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

          {/* ================= MODAL BODY ================= */}
          <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            
            {/* 0. TIẾN ĐỘ SẢN XUẤT (1 MÌNH NÓ 1 DÒNG TRÊN CÙNG) */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5 shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" /> Tiến Độ Sản Xuất
                  </h4>

                  {/* Hạn Giao - 1 đoạn nhỏ vừa đủ, cho phép chỉnh ngày tháng giao */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-bold text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">Hạn Giao:</span>
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={handleDeadlineChange}
                      className="bg-transparent font-bold text-xs text-slate-800 dark:text-slate-200 border-none outline-hidden cursor-pointer focus:ring-0 p-0 text-[11.5px]"
                      title="Nhấp để thay đổi ngày hạn giao hàng"
                    />
                    {savedDeadlineAlert && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 animate-fade-in pl-1">
                        <Check className="w-3 h-3" /> Đã lưu
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                {STAGES.map((st, idx) => {
                  const isCurrent = order.status === st.status;
                  const isPast = statusInfo.stepIndex > idx;
                  return (
                    <button
                      key={st.status}
                      type="button"
                      onClick={() => onUpdateStatus(order.id, st.status)}
                      className={`py-2 px-2 rounded-xl font-bold text-[11.5px] border transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
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

            {/* ================= 2-COLUMN SPLIT VIEW ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* ================= COLUMN 1: MÔ TẢ & CHI TIẾT SẢN PHẨM (6 COLS) ================= */}
              <div className="lg:col-span-6 space-y-4">
                
                {/* 1.1 MÔ TẢ & GHI CHÚ ĐƠN HÀNG (BỎ TIÊU ĐỀ PHỤ - CHỈNH SỬA NHANH BẰNG CÁCH NHẤP VÀO Ô) */}
                <div className="p-3.5 pb-2 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/40 pb-1.5">
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
                        onClick={() => handleSaveNotes()}
                        className="px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Save className="w-3 h-3" /> Lưu ghi chú
                      </button>
                    </div>
                  </div>

                  {/* Quick-edit Clickable Textarea */}
                  <textarea
                    rows={4}
                    value={productionNotes}
                    onChange={(e) => setProductionNotes(e.target.value)}
                    onBlur={() => handleSaveNotes()}
                    placeholder="Nhấp vào đây để ghi chú nhanh yêu cầu kỹ thuật, lưu ý in ấn, vị trí logo hoặc dặn dò riêng của khách..."
                    className="w-full p-2.5 text-xs leading-relaxed rounded-xl border border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-hidden transition-all resize-y min-h-[80px]"
                  />

                  {/* Dòng thời gian chỉnh sửa gần nhất - khoảng cách sát, tinh gọn */}
                  <div className="flex items-center justify-between text-[10.5px] leading-none text-slate-500 dark:text-slate-400 px-0.5 pt-0.5 pb-0.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>Chỉnh sửa gần nhất:</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        {notesLastEdited ? formatLastModified(notesLastEdited) : 'Chưa có chỉnh sửa'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1.2 CHI TIẾT MÓN HÀNG & THÔNG SỐ KỸ THUẬT */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" /> Chi Tiết Món Hàng & Thông Số Kỹ Thuật
                    </h4>
                    
                    {/* Defect / Reprint button */}
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

              {/* ================= COLUMN 2: BẢNG BÁO GIÁ CHI TIẾT (6 COLS) ================= */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-rose-400 dark:border-rose-600/60 shadow-sm space-y-3.5">
                  
                  {/* Header: BẢNG BÁO GIÁ CHI TIẾT */}
                  <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-rose-500" /> BẢNG BÁO GIÁ CHI TIẾT
                      </h4>
                      <span className="px-2.5 py-0.5 bg-rose-500 text-white font-black text-xs rounded-full shadow-2xs font-mono">
                        {pricingCalculations.totalItemsCount} MÓN
                      </span>
                    </div>

                    {!isEditingQuote ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingQuote(true)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-xl font-bold text-xs border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Chỉnh Sửa
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleCancelEditQuote}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAllQuoteChanges}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" /> Lưu
                        </button>
                      </div>
                    )}
                  </div>

                  {/* MODE 1: READ-ONLY / VIEW MODE (Mặc định cho thẻ Kanban) */}
                  {!isEditingQuote ? (
                    <div className="space-y-3">
                      {/* Section 1: THÔNG TIN KHÁCH HÀNG (View) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            THÔNG TIN KHÁCH HÀNG:
                          </label>
                          <button
                            type="button"
                            onClick={handleCopyAddress}
                            className={`px-2 py-0.5 rounded text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              copiedAddress
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                            title="Copy thông tin khách"
                          >
                            {copiedAddress ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedAddress ? 'Đã copy!' : 'Copy'}</span>
                          </button>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                {customerName || order.customerName || 'Chưa có tên khách'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                                {customerPhone || order.customerPhone || '---'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {shippingAddress || order.shippingAddress || 'Nhận tại Shop / Chưa nhập địa chỉ'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: VẬN CHUYỂN (View) */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-[11px] font-extrabold uppercase tracking-wide text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" /> VẬN CHUYỂN:
                        </label>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {shippingCarrier === 'khach_lay_tai_xuong'
                              ? '- Nhận tại Shop (0đ)'
                              : shippingCarrier === 'shipper_xuong'
                              ? '- Giao hàng tại nhà (Shipper Xưởng)'
                              : shippingCarrier === 'ahamove'
                              ? '- Ahamove (Giao nhanh)'
                              : shippingCarrier === 'grab_express'
                              ? '- GrabExpress'
                              : shippingCarrier === 'viettel_post'
                              ? '- ViettelPost'
                              : '- Giao Hàng Tiết Kiệm (GHTK)'}
                          </span>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {shippingFee > 0 ? formatCurrency(shippingFee) : '0 đ'}
                          </span>
                        </div>
                      </div>

                      {/* Section 3: CHIẾT KHẤU, TIỀN CỌC & TÙY CHỌN (View) */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                            Chiết khấu (%):
                          </span>
                          <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                            {discountPercent > 0 ? `${discountPercent}%` : '0%'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                            Tiền cọc (đ):
                          </span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {editDepositAmount > 0 ? formatCurrency(editDepositAmount) : '0 đ'}
                          </span>
                        </div>
                      </div>

                      {/* Tùy chọn VAT & Hỏa tốc (View) */}
                      {(includeVAT || isUrgent) && (
                        <div className="flex items-center gap-2 pt-0.5">
                          {includeVAT && (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800">
                              ✓ VAT 8%
                            </span>
                          )}
                          {isUrgent && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800">
                              ⚡ Hỏa tốc (+20%)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Section 4: SUMMARY & BREAKDOWN */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
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
                            <span>Phí hỏa tốc:</span>
                            <span>+ {formatCurrency(pricingCalculations.urgentFee)}</span>
                          </div>
                        )}

                        {pricingCalculations.vatAmount > 0 && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>VAT (8%):</span>
                            <span>+ {formatCurrency(pricingCalculations.vatAmount)}</span>
                          </div>
                        )}

                        {pricingCalculations.shippingFee > 0 && (
                          <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
                            <span>Phí ship:</span>
                            <span>+ {formatCurrency(pricingCalculations.shippingFee)}</span>
                          </div>
                        )}

                        {/* BIG RED GRAND TOTAL */}
                        <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                            TỔNG THANH TOÁN:
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                            {formatCurrency(pricingCalculations.grandTotal)}
                          </span>
                        </div>

                        {/* DEPOSIT & REMAINING ROW - Chỉ hiện khi có tiền cọc (> 0) */}
                        {(editDepositAmount || 0) > 0 && (
                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-700">
                            <span>
                              Đã cọc: <strong className="text-emerald-600 font-mono">{formatCurrency(editDepositAmount || 0)}</strong>
                            </span>
                            <span>
                              Còn lại thu (COD): <strong className="text-rose-600 font-mono">{formatCurrency(remainingBalance)}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Success Alert if Saved */}
                      {savedAllAlert && (
                        <div className="pt-2 text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 animate-fade-in">
                          <CheckCircle2 className="w-4 h-4" /> Đã cập nhật báo giá và thông tin đơn hàng thành công!
                        </div>
                      )}
                    </div>
                  ) : (
                    /* MODE 2: EDIT MODE (Khi người dùng bấm nút Chỉnh Sửa) */
                    <div className="space-y-3.5">
                      {/* Section 1: THÔNG TIN KHÁCH HÀNG (Edit) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                            THÔNG TIN KHÁCH HÀNG:
                          </label>
                          <button
                            type="button"
                            onClick={handleCopyAddress}
                            className={`px-2 py-0.5 rounded text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              copiedAddress
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                            title="Copy thông tin khách"
                          >
                            {copiedAddress ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedAddress ? 'Đã copy!' : 'Copy'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Tên khách hàng / Công ty..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                          />
                          <input
                            type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Số điện thoại..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                          />
                        </div>

                        <input
                          type="text"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Địa chỉ giao hàng (Số nhà, đường, phường/xã, quận/huyện)..."
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Section 2: VẬN CHUYỂN (Edit) */}
                      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-[11px] font-extrabold uppercase tracking-wide text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" /> VẬN CHUYỂN:
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className={shippingCarrier !== 'khach_lay_tai_xuong' ? 'sm:col-span-7' : 'sm:col-span-12'}>
                            <select
                              value={shippingCarrier}
                              onChange={(e) => {
                                const newCarrier = e.target.value as ShippingCarrier;
                                setShippingCarrier(newCarrier);
                                if (newCarrier === 'khach_lay_tai_xuong') {
                                  setShippingFee(0);
                                }
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                            >
                              <option value="khach_lay_tai_xuong">- Nhận tại Shop (0đ)</option>
                              <option value="shipper_xuong">- Giao hàng tại nhà (Shipper Xưởng)</option>
                              <option value="ahamove">- Ahamove (Giao nhanh)</option>
                              <option value="grab_express">- GrabExpress</option>
                              <option value="viettel_post">- ViettelPost</option>
                              <option value="ghtk">- Giao Hàng Tiết Kiệm (GHTK)</option>
                            </select>
                          </div>

                          {shippingCarrier !== 'khach_lay_tai_xuong' && (
                            <div className="sm:col-span-5 relative">
                              <input
                                type="number"
                                min="0"
                                step={5000}
                                value={shippingFee || ''}
                                onChange={(e) => setShippingFee(Math.max(0, Number(e.target.value)))}
                                placeholder="Phí Ship (0đ)..."
                                className="w-full px-3 py-2 pr-7 bg-slate-50 dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600">
                                đ
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 3: CHIẾT KHẤU (%) & TIỀN CỌC (Đ) (Edit) */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Chiết khấu (%):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(Math.max(0, Math.min(50, Number(e.target.value))))}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Tiền cọc (đ):
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step={5000}
                              min="0"
                              value={editDepositAmount || ''}
                              onChange={(e) => setEditDepositAmount(Math.max(0, Number(e.target.value)))}
                              placeholder="0"
                              className="w-full px-3 py-2 pr-7 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden text-right"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                              đ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: CHECKBOXES (Edit) */}
                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700 dark:text-slate-300 select-none">
                          <input
                            type="checkbox"
                            checked={includeVAT}
                            onChange={(e) => setIncludeVAT(e.target.checked)}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                          />
                          <span>VAT 8%</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-amber-600 dark:text-amber-400 select-none">
                          <input
                            type="checkbox"
                            checked={isUrgent}
                            onChange={(e) => setIsUrgent(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>Hỏa tốc (+20%)</span>
                        </label>
                      </div>

                      {/* Section 5: SUMMARY & BREAKDOWN (Edit Mode Live View) */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
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
                            <span>Phí hỏa tốc:</span>
                            <span>+ {formatCurrency(pricingCalculations.urgentFee)}</span>
                          </div>
                        )}

                        {pricingCalculations.vatAmount > 0 && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>VAT (8%):</span>
                            <span>+ {formatCurrency(pricingCalculations.vatAmount)}</span>
                          </div>
                        )}

                        {pricingCalculations.shippingFee > 0 && (
                          <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
                            <span>Phí ship:</span>
                            <span>+ {formatCurrency(pricingCalculations.shippingFee)}</span>
                          </div>
                        )}

                        {/* BIG RED GRAND TOTAL */}
                        <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                            TỔNG THANH TOÁN:
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                            {formatCurrency(pricingCalculations.grandTotal)}
                          </span>
                        </div>

                        {/* DEPOSIT & REMAINING ROW - Chỉ hiện khi có tiền cọc (> 0) */}
                        {(editDepositAmount || 0) > 0 && (
                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-700">
                            <span>
                              Đã cọc: <strong className="text-emerald-600 font-mono">{formatCurrency(editDepositAmount || 0)}</strong>
                            </span>
                            <span>
                              Còn lại thu (COD): <strong className="text-rose-600 font-mono">{formatCurrency(remainingBalance)}</strong>
                            </span>
                          </div>
                        )}
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
