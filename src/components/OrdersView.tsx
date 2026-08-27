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
  ExternalLink
} from 'lucide-react';
import { Order, OrderStatus, PriorityLevel, PaymentStatus } from '../types';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getOrderStatusInfo,
  getPriorityInfo,
  getPaymentStatusInfo,
} from '../utils/formatters';

interface OrdersViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOpenNewOrder: () => void;
  onPrintJobTicket: (order: Order) => void;
}

const KANBAN_STAGES: { status: OrderStatus; label: string; desc: string; color: string }[] = [
  { status: 'tiep_nhan', label: '1. Tiếp Nhận & Báo Giá', desc: 'Đơn mới tạo, tính giá phôi & in', color: 'border-blue-500' },
  { status: 'duyet_mockup', label: '2. Chờ Duyệt Mockup', desc: 'Gửi file demo khách duyệt logo', color: 'border-amber-500' },
  { status: 'che_ban', label: '3. Chế Bản & Set Máy', desc: 'Xuất phim, pha mực, gá khuôn in', color: 'border-purple-500' },
  { status: 'dang_in', label: '4. Đang In Ấn / Khắc', desc: 'Chạy máy UV, Laser, Ép nhiệt, DTF', color: 'border-indigo-500' },
  { status: 'gia_cong', label: '5. Gia Công & QC', desc: 'Sấy nhiệt, lau sạch, hộp xi nhung', color: 'border-orange-500' },
  { status: 'hoan_tat', label: '6. Đã Hoàn Tất / Giao', desc: 'Khách nghiệm thu & tất toán', color: 'border-emerald-500' },
];

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onSelectOrder,
  onUpdateOrderStatus,
  onOpenNewOrder,
  onPrintJobTicket,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== 'all' && ord.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ord.priority !== priorityFilter) return false;
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      const matchCode = ord.orderCode.toLowerCase().includes(q);
      const matchCustomer = ord.customerName.toLowerCase().includes(q) || (ord.customerCompany && ord.customerCompany.toLowerCase().includes(q));
      const matchProduct = ord.items.some((it) => it.productName.toLowerCase().includes(q));
      if (!matchCode && !matchCustomer && !matchProduct) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" /> Quản Lý Tiến Độ Đơn Hàng Xưởng In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quy trình sản xuất 6 bước khép kín từ tiếp nhận, duyệt mockup đến in ấn và đóng gói.
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
              <LayoutGrid className="w-4 h-4" /> Kanban Pipeline
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
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Tìm theo mã đơn, tên công ty, tên quà tặng..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả mức ưu tiên</option>
          <option value="hoa_toc">🔥 Hỏa tốc 24h</option>
          <option value="gap">⚡ Đơn Gấp</option>
          <option value="binh_thuong">Bình thường</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả công đoạn</option>
          <option value="tiep_nhan">1. Tiếp nhận & Báo giá</option>
          <option value="duyet_mockup">2. Chờ duyệt Mockup</option>
          <option value="che_ban">3. Chế bản & Set máy</option>
          <option value="dang_in">4. Đang in ấn / Khắc</option>
          <option value="gia_cong">5. Gia công & QC</option>
          <option value="hoan_tat">6. Đã hoàn tất / Giao</option>
        </select>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-auto">
          Hiển thị <strong>{filteredOrders.length}</strong> / {orders.length} đơn hàng
        </span>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 items-start">
          {KANBAN_STAGES.map((col) => {
            const stageOrders = filteredOrders.filter((o) => o.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-3 flex flex-col min-h-[480px]"
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

                {/* Orders Stack in this column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[75vh] custom-scrollbar pr-0.5">
                  {stageOrders.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Chưa có đơn ở công đoạn này</p>
                    </div>
                  ) : (
                    stageOrders.map((ord) => {
                      const priorityInfo = getPriorityInfo(ord.priority);
                      const paymentInfo = getPaymentStatusInfo(ord.paymentStatus);
                      return (
                        <div
                          key={ord.id}
                          onClick={() => onSelectOrder(ord)}
                          className="p-3.5 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
                        >
                          {/* Order Code & Priority Tag */}
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className="font-bold text-xs text-blue-600 dark:text-blue-400 group-hover:underline">
                              {ord.orderCode}
                            </span>
                            {ord.priority !== 'binh_thuong' && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityInfo.badge}`}>
                                {priorityInfo.label}
                              </span>
                            )}
                          </div>

                          {/* Customer Name */}
                          <p className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                            {ord.customerCompany || ord.customerName}
                          </p>

                          {/* Primary Item Preview */}
                          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                              {ord.items[0]?.productName}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              <span className="font-bold text-slate-900 dark:text-white">
                                SL: {ord.items[0]?.quantity} chiếc
                              </span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(ord.totalAmount)}
                              </span>
                            </div>
                          </div>

                          {/* Print Technique & Positions */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {ord.items[0]?.printPositions.map((pos) => (
                              <span
                                key={pos.id}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                              >
                                {pos.name} ({pos.technique.toUpperCase()})
                              </span>
                            ))}
                          </div>

                          {/* Footer: Deadline & Action */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(ord.deadline)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPrintJobTicket(ord);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="In phiếu lệnh sản xuất xưởng"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Move Button */}
                          {col.status !== 'hoan_tat' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = KANBAN_STAGES.findIndex((s) => s.status === ord.status);
                                if (currentIndex < KANBAN_STAGES.length - 1) {
                                  onUpdateOrderStatus(ord.id, KANBAN_STAGES[currentIndex + 1].status);
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
                  <th className="py-3 px-4">Mã Đơn</th>
                  <th className="py-3 px-4">Khách Hàng / Công Ty</th>
                  <th className="py-3 px-4">Sản Phẩm & Phôi Quà Tặng</th>
                  <th className="py-3 px-4">Công Nghệ In</th>
                  <th className="py-3 px-4">Tổng Tiền / Thanh Toán</th>
                  <th className="py-3 px-4">Tiến Độ Xưởng</th>
                  <th className="py-3 px-4">Hạn Giao</th>
                  <th className="py-3 px-4 text-right">Lệnh Xưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((ord) => {
                  const statusInfo = getOrderStatusInfo(ord.status);
                  const priorityInfo = getPriorityInfo(ord.priority);
                  const paymentInfo = getPaymentStatusInfo(ord.paymentStatus);
                  return (
                    <tr
                      key={ord.id}
                      onClick={() => onSelectOrder(ord)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {ord.orderCode}
                        {ord.priority !== 'binh_thuong' && (
                          <div className={`mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityInfo.badge}`}>
                            {priorityInfo.label}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {ord.customerCompany || ord.customerName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {ord.customerPhone}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {ord.items[0]?.productName}
                        </p>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          Số lượng: {ord.items[0]?.quantity} chiếc
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {ord.items[0]?.printPositions.map((p) => (
                            <span key={p.id} className="text-[11px] text-slate-600 dark:text-slate-300">
                              • {p.name}: <strong className="uppercase">{p.technique}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(ord.totalAmount)}
                        </p>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${paymentInfo.bg}`}>
                          {paymentInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {formatDate(ord.deadline)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPrintJobTicket(ord);
                            }}
                            className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> Phiếu Lệnh
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
