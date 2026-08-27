import React, { useState } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  PlusCircle,
  Clock,
  Printer,
  ChevronRight,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Phone,
  Building2,
  ExternalLink,
  Truck,
  Copy,
  Check,
  Image as ImageIcon,
  MapPin,
  GripVertical,
  Share2
} from 'lucide-react';
import { Order, OrderStatus, PriorityLevel, PaymentStatus, ProofStatus } from '../types';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getOrderStatusInfo,
  getPriorityInfo,
  getPaymentStatusInfo,
  getProofStatusInfo,
  getCarrierInfo,
  getShippingStatusInfo,
  formatShippingInfoText,
} from '../utils/formatters';

interface OrdersViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOpenNewOrder: () => void;
  onPrintJobTicket: (order: Order) => void;
  onPrintDeliveryReceipt?: (order: Order) => void;
}

const KANBAN_STAGES: { status: OrderStatus; label: string; desc: string; color: string }[] = [
  { status: 'dang_thiet_ke', label: '1. Đang thiết kế', desc: 'Thiết kế mockup & duyệt mẫu qua Zalo', color: 'border-blue-500' },
  { status: 'da_in_cho_ep', label: '2. Đã in / Chờ ép', desc: 'Đã in giấy nhiệt/decal, chờ lên máy ép', color: 'border-amber-500' },
  { status: 'da_ep_cho_giao', label: '3. Đã ép / Chờ Giao', desc: 'Đã ép xong, kiểm tra QC & đóng gói', color: 'border-purple-500' },
  { status: 'dang_giao', label: '4. Đang giao', desc: 'Shipper đang giao hàng cho khách', color: 'border-emerald-500' },
];

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders = [],
  onSelectOrder,
  onUpdateOrderStatus,
  onOpenNewOrder,
  onPrintJobTicket,
  onPrintDeliveryReceipt,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [groupFilter, setGroupFilter] = useState<'all' | 'chuyen_nhiet' | 'in_anh_thuong'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [proofFilter, setProofFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [copiedProofId, setCopiedProofId] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<OrderStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('text/plain', orderId);
    setDraggedOrderId(orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedOrderId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, stageStatus: OrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== stageStatus) {
      setDragOverColumn(stageStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stageStatus: OrderStatus) => {
    e.preventDefault();
    // Only clear if leaving the column boundary
    if (dragOverColumn === stageStatus) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (orderId) {
      onUpdateOrderStatus(orderId, targetStatus);
    }
    setDraggedOrderId(null);
    setDragOverColumn(null);
  };

  const handleCopyShipping = (e: React.MouseEvent, ord: Order) => {
    e.stopPropagation();
    const text = formatShippingInfoText(ord);
    navigator.clipboard.writeText(text);
    setCopiedOrderId(ord.id);
    setTimeout(() => {
      setCopiedOrderId(null);
    }, 2000);
  };

  const handleCopyProofLink = (e: React.MouseEvent, ord: Order) => {
    e.stopPropagation();
    const shareUrl = `https://mockup.giftprint.vn/p/${ord.proofDesign?.shareCode || ord.orderCode.toLowerCase()}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedProofId(ord.id);
    setTimeout(() => {
      setCopiedProofId(null);
    }, 2000);
  };

  // Filtered orders
  const filteredOrders = (orders || []).filter((ord) => {
    if (groupFilter !== 'all' && ord.serviceGroup !== groupFilter) return false;
    if (statusFilter !== 'all' && ord.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ord.priority !== priorityFilter) return false;
    if (proofFilter !== 'all') {
      const currentProofStatus = ord.proofDesign?.status || 'cho_gui_mockup';
      if (currentProofStatus !== proofFilter) return false;
    }
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      const matchCode = ord.orderCode.toLowerCase().includes(q);
      const matchCustomer = ord.customerName.toLowerCase().includes(q) || (ord.customerCompany && ord.customerCompany.toLowerCase().includes(q));
      const matchProduct = ord.items.some((it) => it.productName.toLowerCase().includes(q));
      const matchTracking = ord.shippingInfo?.trackingCode?.toLowerCase().includes(q);
      if (!matchCode && !matchCustomer && !matchProduct && !matchTracking) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" /> Quản Lý Đơn Hàng & Duyệt Mẫu In (Proofing)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quy trình xưởng 4 bước tinh gọn: Đang thiết kế ➔ Đã in / Chờ ép ➔ Đã ép / Chờ giao ➔ Đang giao.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View Mode */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban Pipeline (4 Cột)
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <List className="w-4 h-4" /> Dạng Bảng (Table)
            </button>
          </div>

          {/* New Order */}
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Tạo Đơn Mới
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Service Group Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setGroupFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              groupFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Tất Cả ({orders.length})
          </button>
          <button
            onClick={() => setGroupFilter('chuyen_nhiet')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              groupFilter === 'chuyen_nhiet'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            🔥 Chuyển Nhiệt
          </button>
          <button
            onClick={() => setGroupFilter('in_anh_thuong')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              groupFilter === 'in_anh_thuong'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            📸 In Ảnh & Nhãn
          </button>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Tìm mã đơn, khách hàng, tên quà, mã vận đơn..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 font-medium"
        >
          <option value="all">Tất cả mức ưu tiên</option>
          <option value="hoa_toc">🔥 Hỏa tốc 24h</option>
          <option value="gap">⚡ Đơn Gấp</option>
          <option value="binh_thuong">Bình thường</option>
        </select>

        {/* Proof Status Filter */}
        <select
          value={proofFilter}
          onChange={(e) => setProofFilter(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 font-bold"
        >
          <option value="all">Tất cả trạng thái Mockup</option>
          <option value="cho_gui_mockup">1. Chờ gửi mockup</option>
          <option value="cho_khach_duyet">2. Đang chờ khách duyệt</option>
          <option value="khach_da_duyet">3. ✓ Khách đã duyệt (OK in)</option>
          <option value="yeu_cau_sua">4. ⚠️ Yêu cầu sửa mẫu</option>
        </select>

        {/* Stage Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 font-medium"
        >
          <option value="all">Tất cả 4 công đoạn xưởng</option>
          <option value="dang_thiet_ke">1. Đang thiết kế</option>
          <option value="da_in_cho_ep">2. Đã in / Chờ ép</option>
          <option value="da_ep_cho_giao">3. Đã ép / Chờ Giao</option>
          <option value="dang_giao">4. Đang giao</option>
        </select>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-auto">
          Hiển thị <strong>{filteredOrders.length}</strong> / {orders.length} đơn hàng
        </span>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {KANBAN_STAGES.map((col) => {
            const stageOrders = filteredOrders.filter((o) => {
              if (col.status === 'dang_thiet_ke') return o.status === 'dang_thiet_ke' || o.status === 'tiep_nhan' || o.status === 'duyet_mockup';
              if (col.status === 'da_in_cho_ep') return o.status === 'da_in_cho_ep' || o.status === 'che_ban' || o.status === 'dang_in';
              if (col.status === 'da_ep_cho_giao') return o.status === 'da_ep_cho_giao' || o.status === 'gia_cong';
              if (col.status === 'dang_giao') return o.status === 'dang_giao';
              return o.status === col.status;
            });
            const isColumnTarget = dragOverColumn === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={(e) => handleDragLeave(e, col.status)}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`rounded-2xl border p-3 flex flex-col min-h-[500px] transition-all ${
                  isColumnTarget
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/50 shadow-md scale-[1.01]'
                    : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80'
                }`}
              >
                {/* Column Header */}
                <div className={`border-t-4 ${col.color} pt-2 pb-3 mb-2 px-1`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white tracking-tight">
                      {col.label}
                    </h3>
                    <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs">
                      {stageOrders.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {col.desc}
                  </p>
                </div>

                {/* Drop Indicator placeholder when dragging over empty space */}
                {isColumnTarget && draggedOrderId && (
                  <div className="mb-2 p-2 rounded-xl border-2 border-dashed border-blue-400 bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-[11px] font-bold text-center animate-pulse">
                    Thả đơn vào đây
                  </div>
                )}

                {/* Orders Stack in this column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[75vh] custom-scrollbar pr-0.5">
                  {stageOrders.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Kéo thả đơn vào đây</p>
                    </div>
                  ) : (
                    stageOrders.map((ord) => {
                      const priorityInfo = getPriorityInfo(ord.priority);
                      const paymentInfo = getPaymentStatusInfo(ord.paymentStatus);
                      const proofInfo = getProofStatusInfo(ord.proofDesign?.status);
                      const carrierInfo = getCarrierInfo(ord.shippingInfo?.carrier || 'ahamove');
                      const mainItem = ord.items[0];
                      const isCopied = copiedOrderId === ord.id;
                      const isProofCopied = copiedProofId === ord.id;
                      const isBeingDragged = draggedOrderId === ord.id;

                      return (
                        <div
                          key={ord.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, ord.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onSelectOrder(ord)}
                          className={`p-3 bg-white dark:bg-slate-800/90 rounded-xl border shadow-xs transition-all cursor-grab active:cursor-grabbing group ${
                            isBeingDragged
                              ? 'opacity-40 scale-95 border-blue-500 ring-2 ring-blue-400 shadow-lg'
                              : 'border-slate-200/80 dark:border-slate-700/80 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          {/* Order Code & Priority Tag & Quick Copy */}
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" title="Kéo thả thẻ đơn hàng">
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                              <span className="font-bold text-xs text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                                {ord.orderCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {ord.priority !== 'binh_thuong' && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityInfo.badge}`}>
                                  {priorityInfo.label}
                                </span>
                              )}
                              <button
                                onClick={(e) => handleCopyShipping(e, ord)}
                                className={`p-1 rounded-md transition-all ${
                                  isCopied
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
                                }`}
                                title="Copy thông tin gửi ship nhanh"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Customer Name & Phone */}
                          <div className="mb-2">
                            <p className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                              {ord.customerCompany || ord.customerName}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" /> {ord.customerPhone}
                            </p>
                          </div>

                          {/* Primary Item Preview with Thumbnail */}
                          <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                            {mainItem?.mockupUrl ? (
                              <img
                                src={mainItem.mockupUrl}
                                alt={mainItem.productName}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-1 leading-tight">
                                {mainItem?.productName}
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                <span className="font-bold text-slate-900 dark:text-white text-[10px]">
                                  SL: {mainItem?.quantity} chiếc
                                </span>
                                <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                                  {formatCurrency(ord.totalAmount)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Proof Design Status & Share Button */}
                          <div className="mt-2 flex items-center justify-between gap-1 p-1.5 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${proofInfo.badge}`}>
                              {proofInfo.label}
                            </span>

                            <button
                              onClick={(e) => handleCopyProofLink(e, ord)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                isProofCopied
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                              }`}
                              title="Copy link gửi khách duyệt mẫu qua Zalo"
                            >
                              {isProofCopied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                              <span>{isProofCopied ? 'Đã copy' : 'Link Zalo'}</span>
                            </button>
                          </div>

                          {/* Shipping carrier info if assigned */}
                          {ord.shippingInfo?.trackingCode && (
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
                              <span className="flex items-center gap-1 font-medium">
                                <Truck className="w-3 h-3 text-emerald-600" /> {carrierInfo.label}
                              </span>
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                {ord.shippingInfo.trackingCode}
                              </span>
                            </div>
                          )}

                          {/* Footer: Deadline & Action */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(ord.deadline)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              {onPrintDeliveryReceipt && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPrintDeliveryReceipt(ord);
                                  }}
                                  className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  title="Xuất phiếu giao hàng A6/A7"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPrintJobTicket(ord);
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1 border border-blue-200 dark:border-blue-800"
                                title="In phiếu lệnh sản xuất xưởng A4/A5"
                              >
                                <Printer className="w-3 h-3 text-blue-600" /> Lệnh
                              </button>
                            </div>
                          </div>

                          {/* Quick Move Button */}
                          {col.status === 'dang_giao' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateOrderStatus(ord.id, 'hoan_tat');
                              }}
                              className="w-full mt-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg flex items-center justify-center gap-1 transition-colors border border-emerald-200 dark:border-emerald-800"
                            >
                              <span>✓ Hoàn Tất & Lưu Trữ</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const stageIndex = KANBAN_STAGES.findIndex((s) => s.status === col.status);
                                if (stageIndex >= 0 && stageIndex < KANBAN_STAGES.length - 1) {
                                  onUpdateOrderStatus(ord.id, KANBAN_STAGES[stageIndex + 1].status);
                                }
                              }}
                              className="w-full mt-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>Chuyển bước kế tiếp</span> <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-16 text-center">Ảnh Mockup</th>
                  <th className="py-3 px-4">Mã Đơn</th>
                  <th className="py-3 px-4">Duyệt Mẫu (Proof)</th>
                  <th className="py-3 px-4">Khách Hàng / Gửi Ship</th>
                  <th className="py-3 px-4">Sản Phẩm & Phôi Quà Tặng</th>
                  <th className="py-3 px-4">Vận Chuyển & COD</th>
                  <th className="py-3 px-4">Tổng Tiền / Thanh Toán</th>
                  <th className="py-3 px-4">Tiến Độ Xưởng</th>
                  <th className="py-3 px-4">Hạn Giao</th>
                  <th className="py-3 px-4 text-right">Lệnh & Giao Hàng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((ord) => {
                  const statusInfo = getOrderStatusInfo(ord.status);
                  const priorityInfo = getPriorityInfo(ord.priority);
                  const paymentInfo = getPaymentStatusInfo(ord.paymentStatus);
                  const proofInfo = getProofStatusInfo(ord.proofDesign?.status);
                  const carrierInfo = getCarrierInfo(ord.shippingInfo?.carrier || 'ahamove');
                  const mainItem = ord.items[0];
                  const isCopied = copiedOrderId === ord.id;
                  const isProofCopied = copiedProofId === ord.id;

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => onSelectOrder(ord)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Thumbnail Image Column */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="relative inline-block group/thumb">
                          {mainItem?.mockupUrl ? (
                            <img
                              src={mainItem.mockupUrl}
                              alt={mainItem.productName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs group-hover/thumb:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          {ord.items.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[9px] font-bold px-1 rounded-full border border-white dark:border-slate-900">
                              +{ord.items.length - 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Order Code */}
                      <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {ord.orderCode}
                        {ord.priority !== 'binh_thuong' && (
                          <div className={`mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityInfo.badge}`}>
                            {priorityInfo.label}
                          </div>
                        )}
                      </td>

                      {/* Proof Design Status & Share link */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${proofInfo.badge}`}>
                            {proofInfo.label}
                          </span>
                          <div>
                            <button
                              onClick={(e) => handleCopyProofLink(e, ord)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all border ${
                                isProofCopied
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800 hover:bg-indigo-100'
                              }`}
                              title="Sao chép link mockup gửi khách Zalo duyệt"
                            >
                              {isProofCopied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3 text-indigo-600" />}
                              <span>{isProofCopied ? 'Đã copy link!' : 'Copy link Zalo'}</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Customer & Shipping Quick Copy */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {ord.customerCompany || ord.customerName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> {ord.customerPhone}
                            </p>
                            {ord.shippingAddress && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 max-w-[180px]" title={ord.shippingAddress}>
                                {ord.shippingAddress}
                              </p>
                            )}
                          </div>

                          {/* Quick Copy Ship Button */}
                          <button
                            onClick={(e) => handleCopyShipping(e, ord)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 border ${
                              isCopied
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700'
                            }`}
                            title="1 Click copy thông tin: Tên, SĐT, Địa chỉ, Tiền COD, Ghi chú"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã Copy!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-blue-600" />
                                <span>Copy Ship</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Product Name & Quantity */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[200px]">
                          {mainItem?.productName}
                        </p>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">
                          Số lượng: {mainItem?.quantity} chiếc
                        </span>
                      </td>

                      {/* Shipping & COD Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-emerald-600" /> {carrierInfo.label}
                          </span>
                          {ord.shippingInfo?.trackingCode ? (
                            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 block">
                              Mã: {ord.shippingInfo.trackingCode}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic block">Chưa gán mã</span>
                          )}
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                            COD: {formatCurrency(ord.shippingInfo?.codAmount || Math.max(0, ord.totalAmount - ord.depositAmount))}
                          </span>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(ord.totalAmount)}
                        </p>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${paymentInfo.bg}`}>
                          {paymentInfo.label}
                        </span>
                      </td>

                      {/* Pipeline Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {formatDate(ord.deadline)}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onPrintDeliveryReceipt && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPrintDeliveryReceipt(ord);
                              }}
                              className="px-2 py-1 text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 border border-rose-200 dark:border-rose-900"
                              title="Xuất phiếu giao hàng A6/A7/K80"
                            >
                              <Truck className="w-3.5 h-3.5 text-rose-600" /> Phiếu Giao
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPrintJobTicket(ord);
                            }}
                            className="px-2 py-1 text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 border border-blue-200 dark:border-blue-800 shadow-2xs"
                            title="In phiếu lệnh sản xuất xưởng A4/A5"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-600" /> In Lệnh
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
