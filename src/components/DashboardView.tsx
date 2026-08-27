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
  Phone
} from 'lucide-react';
import { Order, GiftProduct, Machine } from '../types';
import { formatCurrency, formatNumber, formatDate, getOrderStatusInfo, getPriorityInfo, getPaymentStatusInfo } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO } from '../data/mockData';

interface DashboardViewProps {
  orders: Order[];
  products: GiftProduct[];
  machines: Machine[];
  onSelectOrder: (order: Order) => void;
  onNavigateTab: (tab: any) => void;
  onOpenNewOrder: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  machines,
  onSelectOrder,
  onNavigateTab,
  onOpenNewOrder,
}) => {
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month'>('week');

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'hoan_tat' && o.status !== 'huy_don').length;
  const inPrintCount = orders.filter((o) => o.status === 'dang_in').length;
  const totalStockItems = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockAlert);
  const activeMachines = machines.filter((m) => m.status === 'dang_in').length;

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

  // Technique distribution
  const techniqueCounts = {
    uv: 38,
    laser: 28,
    chuyen_nhiet: 16,
    dtf: 12,
    ep_kim: 6,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              Phiên Bản TailAdmin Pro • Xưởng In Quà Tặng
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Bảng Quản Trị Đơn Hàng & Sản Xuất In Ấn
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Theo dõi tiến độ đơn hàng quà tặng, công suất máy khắc/in, tồn kho phôi và duyệt bản in theo thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('quote_calculator')}
            className="px-4 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-xl backdrop-blur-xs transition-colors border border-white/20"
          >
            Báo Giá Nhanh
          </button>
          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2 text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-md transition-all active:scale-95"
          >
            + Tiếp Nhận Đơn Mới
          </button>
        </div>
      </div>

      {/* TailAdmin Style 4 Core Metric Cards */}
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
              {inPrintCount} đang in
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

        {/* Card 3: Công suất máy xưởng */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
              {activeMachines}/{machines.length} Máy chạy
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              98.2%
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Tỷ Lệ Giao Đúng Hạn (On-Time Delivery)
            </p>
          </div>
        </div>

        {/* Card 4: Tồn kho phôi */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package className="w-6 h-6" />
            </div>
            {lowStockProducts.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                <AlertCircle className="w-3 h-3" /> {lowStockProducts.length} phôi sắp hết
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Tồn kho an toàn
              </span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatNumber(totalStockItems)} Phôi
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Bình giữ nhiệt, cốc sứ, sổ da, bút ký...
            </p>
          </div>
        </div>
      </div>

      {/* TailAdmin Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue & Cost Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Biểu Đồ Doanh Thu & Chi Phí Sản Xuất In Ấn
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Thống kê 7 ngày gần nhất (Bao gồm tiền phôi + công in ấn)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-slate-600 dark:text-slate-300">Doanh thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-slate-600 dark:text-slate-300">Giá vốn & Mực</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG / Bar Visualizer */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {revenueData.map((d, idx) => {
              const revPercent = (d.revenue / maxRevenue) * 100;
              const costPercent = (d.cost / maxRevenue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48 relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-[11px] rounded-lg px-2.5 py-1.5 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                      <p className="font-bold">{d.day}: {formatCurrency(d.revenue)}</p>
                      <p className="text-[10px] text-slate-300">{d.orders} đơn hàng</p>
                    </div>

                    {/* Revenue Bar */}
                    <div
                      className="w-1/2 max-w-[28px] bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${revPercent}%` }}
                    />
                    {/* Cost Bar */}
                    <div
                      className="w-1/2 max-w-[28px] bg-slate-200 dark:bg-slate-700 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${costPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-blue-600">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technique Distribution (Donut & Progress Breakdown) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Tỷ Trọng Doanh Thu 2 Mảng Sản Xuất
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Phân bổ giữa In Chuyển Nhiệt Quà Tặng & In Ảnh / Nhãn Vở
            </p>
          </div>

          <div className="my-4 space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 🔥 In Chuyển Nhiệt (11 Nhóm Phôi)
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">62% (Ly sứ, Áo, Móc khóa, Tranh đá)</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> 📸 In Ảnh & Nhãn Vở Học Sinh
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">38% (Nhãn vở, Polaroid, Khung ảnh)</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300">
                <span className="font-bold">Top Chuyển Nhiệt:</span> Ly sứ quai tim, Móc khóa mica 2 mặt, Tranh đá vát viền
              </div>
              <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300">
                <span className="font-bold">Top In Ảnh:</span> Set 36 nhãn vở bế demi Hologram, Ảnh Polaroid 6x9
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400">
            💡 <strong>Mẹo xưởng:</strong> Mùa tựu trường (Tháng 8-9) doanh thu nhãn vở & ảnh bé tăng 300%. Nên chuẩn bị sẵn cuộn decal bóc dán và màng Hologram 7 màu.
          </div>
        </div>
      </div>

      {/* Workshop Machines & Urgent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Production Orders */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" /> Đơn Hàng Đang Chạy Trong Xưởng
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ưu tiên theo mức độ hỏa tốc và hạn giao hàng
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
                  <th className="pb-2.5 font-semibold">Sản Phẩm & Số Lượng</th>
                  <th className="pb-2.5 font-semibold">Công Đoạn In</th>
                  <th className="pb-2.5 font-semibold">Hạn Giao</th>
                  <th className="pb-2.5 font-semibold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.slice(0, 4).map((ord) => {
                  const statusInfo = getOrderStatusInfo(ord.status);
                  const priorityInfo = getPriorityInfo(ord.priority);
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
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        {formatDate(ord.deadline)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(ord);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          title="Xem chi tiết lệnh in"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Live Machine Fleet Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Tình Trạng Máy Xưởng
            </h3>
            <button
              onClick={() => onNavigateTab('machines')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Chi tiết
            </button>
          </div>

          <div className="space-y-3">
            {machines.slice(0, 4).map((mac) => (
              <div
                key={mac.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
                    {mac.name}
                  </span>
                  {mac.status === 'dang_in' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Đang chạy
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      Sẵn sàng
                    </span>
                  )}
                </div>

                {mac.currentJob ? (
                  <div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      Lệnh: <span className="font-semibold text-blue-600">{mac.currentJob.orderCode}</span> - {mac.currentJob.productName}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${mac.currentJob.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {mac.currentJob.progressPercent}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Máy rảnh, sẵn sàng nhận lệnh mới.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
