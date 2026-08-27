import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  Printer,
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Zap,
  Flame,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Eye,
  CheckCircle2,
  Calendar,
  Building2,
  Phone,
  AlertTriangle,
  Timer,
  FileText,
  ShieldCheck,
  Percent,
  Check,
  ChevronRight
} from 'lucide-react';
import { Order, GiftProduct, Machine, DefectLog } from '../types';
import { formatCurrency, formatNumber, formatDate, formatDateTime, getOrderStatusInfo, getPriorityInfo, getPaymentStatusInfo, getProofStatusInfo } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO } from '../data/mockData';

interface DashboardViewProps {
  orders: Order[];
  products: GiftProduct[];
  machines: Machine[];
  defectLogs?: DefectLog[];
  onSelectOrder: (order: Order) => void;
  onNavigateTab: (tab: any) => void;
  onOpenNewOrder: () => void;
  onPrintJobTicket?: (order: Order) => void;
  onOpenDefectModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders = [],
  products = [],
  machines = [],
  defectLogs = [],
  onSelectOrder,
  onNavigateTab,
  onOpenNewOrder,
  onPrintJobTicket,
  onOpenDefectModal,
}) => {
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month'>('week');

  // Stats
  const totalRevenue = (orders || []).reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
  const activeOrders = (orders || []).filter((o) => o.status !== 'hoan_tat' && o.status !== 'huy_don');
  const activeOrdersCount = activeOrders.length;
  const inPrintCount = (orders || []).filter((o) => o.status === 'dang_in').length;
  const totalStockItems = (products || []).reduce((sum, p) => sum + (p?.stockQuantity || 0), 0);
  const lowStockProducts = (products || []).filter((p) => p.stockQuantity <= p.minStockAlert);
  const activeMachines = (machines || []).filter((m) => m.status === 'dang_in').length;

  // 1. DEADLINE ALERTS CALCULATION (Cảnh báo trễ hạn & Đơn hỏa tốc < 24h)
  const now = new Date().getTime();
  const deadlineAlertOrders = activeOrders
    .map((order) => {
      const deadlineTime = new Date(order.deadline).getTime();
      const diffHours = (deadlineTime - now) / (1000 * 60 * 60);
      return {
        ...order,
        diffHours,
        isOverdue: diffHours < 0,
        isUrgent24h: diffHours >= 0 && diffHours <= 24,
      };
    })
    .filter((o) => o.isOverdue || o.isUrgent24h || o.priority === 'hoa_toc' || o.priority === 'gap')
    .sort((a, b) => a.diffHours - b.diffHours);

  // 2. SCRAP RATE & DEFECT METRICS (Tỷ lệ Hao hụt & Lỗi in xưởng)
  const totalProducedItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const totalScrappedItems = defectLogs.reduce((sum, d) => sum + d.quantityScrapped, 0);
  const totalCostLoss = defectLogs.reduce((sum, d) => sum + d.estimatedCostLoss, 0);
  const scrapRate = totalProducedItems > 0 
    ? ((totalScrappedItems / (totalProducedItems + totalScrappedItems)) * 100).toFixed(1)
    : '0.0';

  // Group defect by reasons
  const defectReasonsCount: Record<string, { label: string; count: number; cost: number; color: string }> = {
    chay_mau_nhiet: { label: 'Cháy màu / Quá nhiệt ép', count: 0, cost: 0, color: 'bg-rose-500' },
    lech_tam_khuon: { label: 'Lệch tâm / Lệch bon cắt bế', count: 0, cost: 0, color: 'bg-amber-500' },
    vo_nut_phoi: { label: 'Vỡ ly / Nứt đá tự nhiên', count: 0, cost: 0, color: 'bg-purple-500' },
    lem_muc_bot_khi: { label: 'Lem mực / Bọt khí / Tróc men', count: 0, cost: 0, color: 'bg-blue-500' },
    loi_file_khach: { label: 'Sai file / Nhầm tên học sinh', count: 0, cost: 0, color: 'bg-slate-500' },
  };

  defectLogs.forEach((log) => {
    if (defectReasonsCount[log.reason]) {
      defectReasonsCount[log.reason].count += log.quantityScrapped;
      defectReasonsCount[log.reason].cost += log.estimatedCostLoss;
    }
  });

  // Chart data for revenue (7 days)
  const revenueData = [
    { day: 'T2', revenue: 32000000, cost: 18000000, orders: 4 },
    { day: 'T3', revenue: 45000000, cost: 24000000, orders: 7 },
    { day: 'T4', revenue: 28000000, cost: 15000000, orders: 3 },
    { day: 'T5', revenue: 58000000, cost: 31000000, orders: 9 },
    { day: 'T6', revenue: 64000000, cost: 35000000, orders: 11 },
    { day: 'T7', revenue: 41000000, cost: 22000000, orders: 6 },
    { day: 'CN', revenue: 19000000, cost: 10000000, orders: 2 },
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  const formatCountdown = (diffHours: number) => {
    if (diffHours < 0) {
      const overdueH = Math.abs(Math.floor(diffHours));
      const overdueM = Math.abs(Math.floor((diffHours % 1) * 60));
      return `Trễ ${overdueH}h ${overdueM}m`;
    }
    const h = Math.floor(diffHours);
    const m = Math.floor((diffHours % 1) * 60);
    return `Còn ${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              Vận Hành & Sản Xuất Xưởng In Chuyên Nghiệp
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Bảng Quản Trị Đơn Hàng & Điều Phối Xưởng In
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Theo dõi tiến độ in ấn, cảnh báo trễ hạn giao 24h, duyệt mockup khách hàng và kiểm soát tỷ lệ hao hụt phôi.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigateTab('quote_calculator')}
            className="px-4 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-xl backdrop-blur-xs transition-colors border border-white/20"
          >
            Báo Giá Nhanh
          </button>
          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2 text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-blue-600" /> + Tiếp Nhận Đơn Mới
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalRevenue)}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Doanh Số Đơn In Trong Tháng
            </p>
          </div>
        </div>

        {/* Card 2: Đơn đang xử lý */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Printer className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
              {inPrintCount} đang in máy
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {activeOrdersCount} Đơn Hàng
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Đang Chạy Trong Quy Trình Xưởng
            </p>
          </div>
        </div>

        {/* Card 3: Cảnh báo trễ hạn */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Timer className="w-6 h-6" />
            </div>
            {deadlineAlertOrders.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> {deadlineAlertOrders.length} đơn cần ưu tiên
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tiến độ chuẩn
              </span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {deadlineAlertOrders.filter(o => o.isOverdue).length > 0 ? (
                <span className="text-rose-600">{deadlineAlertOrders.filter(o => o.isOverdue).length} Đơn Trễ</span>
              ) : (
                <span>{deadlineAlertOrders.length} Đơn Gấp</span>
              )}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Hỏa tốc & Đến hạn trong 24h tới
            </p>
          </div>
        </div>

        {/* Card 4: Tỷ lệ Hao hụt phôi (Scrap Rate) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Percent className="w-6 h-6" />
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              Number(scrapRate) <= 2.5 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" /> Chuẩn xưởng &lt;2.5%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {scrapRate}% <span className="text-xs font-normal text-slate-400">({totalScrappedItems} phôi hỏng)</span>
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Tỷ Lệ Hao Hụt & Lỗi Ép Nhiệt
            </p>
          </div>
        </div>
      </div>

      {/* WIDGET 1: DEADLINE ALERTS (CẢNH BÁO TRỄ HẠN GIAO & ĐƠN HỎA TỐC 24H) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Timer className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Cảnh Báo Trễ Hạn Giao & Đơn Hỏa Tốc (Deadline Countdown)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {deadlineAlertOrders.length} Đơn khẩn
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đếm ngược thời gian bàn giao khách hàng. Ưu tiên thợ in ép nhiệt và đóng gói ngay.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Xem Kanban Xưởng <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {deadlineAlertOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {deadlineAlertOrders.map((ord) => {
              const statusInfo = getOrderStatusInfo(ord.status);
              const priorityInfo = getPriorityInfo(ord.priority);
              const proofInfo = getProofStatusInfo(ord.proofDesign?.status);
              const isOverdue = ord.diffHours < 0;

              return (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isOverdue
                      ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-900'
                      : ord.priority === 'hoa_toc'
                      ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-900'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {ord.orderCode}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${priorityInfo.badge}`}>
                          {priorityInfo.label}
                        </span>
                      </div>

                      {/* Countdown badge */}
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 shadow-xs ${
                        isOverdue
                          ? 'bg-rose-600 text-white animate-bounce'
                          : 'bg-amber-500 text-white'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {formatCountdown(ord.diffHours)}
                      </span>
                    </div>

                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                      {ord.customerCompany || ord.customerName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      📦 {ord.items[0]?.productName} (SL: {ord.items[0]?.quantity})
                    </p>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-md font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                        {statusInfo.label}
                      </span>
                      {ord.proofDesign && (
                        <span className={`px-1.5 py-0.5 rounded-md font-semibold ${proofInfo.badge}`}>
                          Mockup: {proofInfo.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">
                      Thợ: <strong className="text-slate-800 dark:text-slate-200">{ord.assignedTechnician?.split(' ')[0] || 'Chưa gán'}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onPrintJobTicket && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPrintJobTicket(ord);
                          }}
                          className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold hover:text-blue-600 flex items-center gap-1 shadow-2xs text-[10px]"
                          title="In phiếu lệnh sản xuất"
                        >
                          <Printer className="w-3 h-3 text-blue-600" /> In Lệnh
                        </button>
                      )}
                      <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:underline flex items-center">
                        Xem <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Hiện tại không có đơn nào bị quá hạn hoặc khẩn cấp trong 24h.</p>
            <p className="text-[11px] text-slate-500">Mọi đơn hàng đều đang tiến hành đúng lịch trình xưởng.</p>
          </div>
        )}
      </div>

      {/* WIDGET 2: SCRAP RATE & DEFECT LOG BREAKDOWN (TỶ LỆ HAO HỤT & LỖI IN XƯỞNG) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scrap Rate Details */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" /> Tỷ Lệ Hao Hụt & Lỗi In Xưởng (Scrap Rate)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kiểm soát chất lượng mực, nhiệt độ ép & tay nghề thợ
              </p>
            </div>
            {onOpenDefectModal && (
              <button
                onClick={onOpenDefectModal}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all border border-rose-200 dark:border-rose-900 shrink-0"
              >
                + Báo Lỗi/Bù Phôi
              </button>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tỷ lệ hao hụt hiện tại</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{scrapRate}%</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Mục tiêu &le; 2.5%
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">Thiệt hại phôi hỏng</p>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                -{formatCurrency(totalCostLoss)}
              </p>
            </div>
          </div>

          {/* Breakdown Bars */}
          <div className="space-y-3 pt-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Phân Loại Nguyên Nhân Hỏng Phôi:
            </p>
            {Object.entries(defectReasonsCount).map(([key, item]) => {
              const percent = totalScrappedItems > 0 ? (item.count / totalScrappedItems) * 100 : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} /> {item.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.count} cái ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
            💡 <strong>Khuyến nghị QC:</strong> Đa số lỗi cháy màu do máy ép phẳng để nhiệt &gt;200°C quá 60s. Khuyên thợ chuyển sang 185°C kèm giấy Sublimation Hàn Quốc.
          </div>
        </div>

        {/* Live Workshop Production Table */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blue-600" /> Lệnh In Ấn Đang Chạy Trong Xưởng
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tình trạng duyệt mockup, thợ phụ trách và hạn xuất xưởng
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Xem tất cả đơn <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="pb-2.5 font-semibold">Mã Đơn & Khách Hàng</th>
                    <th className="pb-2.5 font-semibold">Sản Phẩm & SL</th>
                    <th className="pb-2.5 font-semibold">Duyệt Mẫu (Proof)</th>
                    <th className="pb-2.5 font-semibold">Công Đoạn Xưởng</th>
                    <th className="pb-2.5 font-semibold">Hạn Giao</th>
                    <th className="pb-2.5 font-semibold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.slice(0, 5).map((ord) => {
                    const statusInfo = getOrderStatusInfo(ord.status);
                    const priorityInfo = getPriorityInfo(ord.priority);
                    const proofInfo = getProofStatusInfo(ord.proofDesign?.status);

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => onSelectOrder(ord)}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {ord.orderCode}
                            </span>
                            {ord.priority !== 'binh_thuong' && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityInfo.badge}`}>
                                {priorityInfo.label}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {ord.customerCompany || ord.customerName}
                          </p>
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                            {ord.items[0]?.productName}
                          </p>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                            {ord.items[0]?.quantity} chiếc
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${proofInfo.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${proofInfo.dot}`} />
                            {proofInfo.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 font-medium">
                          {formatDate(ord.deadline)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onPrintJobTicket && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPrintJobTicket(ord);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                title="In phiếu lệnh sản xuất"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectOrder(ord);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                              title="Xem chi tiết lệnh in & duyệt mockup"
                            >
                              <Eye className="w-4 h-4" />
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

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Hiển thị 5 lệnh in mới nhất trong ca</span>
            <button
              onClick={() => onNavigateTab('machines')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              Kiểm tra tình trạng máy móc & công suất <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
