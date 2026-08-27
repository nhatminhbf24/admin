import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  Users,
  Building,
  Zap,
  HeartHandshake,
  Truck,
  Copy,
  Check,
  Download,
  PlusCircle,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  Order,
  GiftProduct,
  DefectLog,
  FinancialVoucher,
} from '../types';
import {
  formatCurrency,
  formatNumber,
  formatDate,
} from '../utils/formatters';

interface FinancialJarSplitViewProps {
  orders: Order[];
  products: GiftProduct[];
  defectLogs: DefectLog[];
  financialVouchers: FinancialVoucher[];
  onAddVoucher: (voucher: FinancialVoucher) => void;
  onSelectOrder?: (order: Order) => void;
}

export type JarTimeFilter = 'this_month' | 'last_month' | 'this_week' | 'today' | 'custom' | 'all';

export const FinancialJarSplitView: React.FC<FinancialJarSplitViewProps> = ({
  orders,
  products,
  defectLogs,
  financialVouchers,
  onAddVoucher,
  onSelectOrder,
}) => {
  // Time period filter
  const [timeFilter, setTimeFilter] = useState<JarTimeFilter>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-31');

  // Profit calculation mode
  const [profitMode, setProfitMode] = useState<'order_gross' | 'net_after_opex' | 'custom_input'>('order_gross');
  const [customProfitInput, setCustomProfitInput] = useState<number>(0);

  // Status filter for orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'completed_only' | 'paid_only'>('all');

  // ----------------------------------------------------------------------
  // ALLOCATION PERCENTAGES (Gộp chung 1 bảng - Tổng 100%)
  // ----------------------------------------------------------------------
  const [rateChua, setRateChua] = useState<number>(10);   // Chúa: 10%
  const [rateDien, setRateDien] = useState<number>(10);   // Điện: 10%
  const [rateDauTu, setRateDauTu] = useState<number>(10); // Đầu tư: 10%
  const [rateDung, setRateDung] = useState<number>(30);   // Dung: 30%
  const [rateNhat, setRateNhat] = useState<number>(40);   // Nhật: 40%

  // Interactive UI states
  const [copiedZalo, setCopiedZalo] = useState<boolean>(false);
  const [voucherCreatedMessage, setVoucherCreatedMessage] = useState<string | null>(null);
  const [isEditingRates, setIsEditingRates] = useState<boolean>(false);

  // Reset to default percentages
  const handleResetDefaultRates = () => {
    setRateChua(10);
    setRateDien(10);
    setRateDauTu(10);
    setRateDung(30);
    setRateNhat(40);
  };

  // ----------------------------------------------------------------------
  // 1. FILTER ORDERS BY TIME RANGE
  // ----------------------------------------------------------------------
  const filteredOrders = useMemo(() => {
    const now = new Date('2026-08-27T00:00:00Z');
    const startOfMonth = new Date('2026-08-01T00:00:00Z');
    const endOfMonth = new Date('2026-08-31T23:59:59Z');
    const startOfLastMonth = new Date('2026-07-01T00:00:00Z');
    const endOfLastMonth = new Date('2026-07-31T23:59:59Z');
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date('2026-08-27T00:00:00Z');

    return orders.filter((ord) => {
      // Order status filter
      if (orderStatusFilter === 'completed_only' && ord.status !== 'hoan_tat' && ord.status !== 'dang_giao') return false;
      if (orderStatusFilter === 'paid_only' && ord.paymentStatus !== 'da_tat_toan') return false;

      // Time period filter
      const ordDate = new Date(ord.createdAt);
      if (timeFilter === 'this_month') {
        return ordDate >= startOfMonth && ordDate <= endOfMonth;
      }
      if (timeFilter === 'last_month') {
        return ordDate >= startOfLastMonth && ordDate <= endOfLastMonth;
      }
      if (timeFilter === 'this_week') {
        return ordDate >= sevenDaysAgo;
      }
      if (timeFilter === 'today') {
        return ordDate >= startOfToday;
      }
      if (timeFilter === 'custom') {
        const start = new Date(customStartDate + 'T00:00:00Z');
        const end = new Date(customEndDate + 'T23:59:59Z');
        return ordDate >= start && ordDate <= end;
      }
      return true;
    });
  }, [orders, timeFilter, customStartDate, customEndDate, orderStatusFilter]);

  // ----------------------------------------------------------------------
  // 2. FINANCIAL & PROFIT CALCULATIONS
  // ----------------------------------------------------------------------
  const calculationSummary = useMemo(() => {
    // Total Order Revenue
    const grossOrderRevenue = filteredOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);

    // Defect / Scrap cost
    const filteredScrapCost = defectLogs.reduce((sum, d) => sum + d.estimatedCostLoss, 0);

    // Orders with collected shipping fee
    const shippingOrders = filteredOrders.filter(
      (ord) => (ord.shippingFeeCollected && ord.shippingFeeCollected > 0) || ord.shippingInfo?.carrier === 'ahamove' || ord.shippingInfo?.carrier === 'ghtk'
    );

    // Total Shipping Fee Collected from customers (Lưu riêng quỹ ship)
    const totalShippingFeeCollected = filteredOrders.reduce((sum, ord) => {
      if (ord.shippingFeeCollected) return sum + ord.shippingFeeCollected;
      if (ord.shippingInfo?.carrier === 'ahamove') return sum + 35000;
      if (ord.shippingInfo?.carrier === 'ghtk') return sum + 30000;
      return sum;
    }, 0);

    // Pure Print Revenue (Doanh thu in sau khi tách tiền ship)
    const netPrintRevenue = Math.max(0, grossOrderRevenue - totalShippingFeeCollected);

    // Cost of Goods Sold (Phôi + Mực in/decal)
    let totalBlankCost = 0;
    let totalMaterialCost = 0;

    filteredOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        const prod = products.find((p) => p.sku === item.sku || p.name === item.productName);
        const blankCost = prod?.basePrice || item.unitPrice * 0.45;
        totalBlankCost += blankCost * item.quantity;
        totalMaterialCost += (item.printPricePerUnit || 5000) * item.quantity;
      });
    });

    const totalCOGS = totalBlankCost + totalMaterialCost + filteredScrapCost;

    // Order Gross Profit
    const calculatedOrderProfit = Math.max(0, netPrintRevenue - totalCOGS);

    // OPEX from vouchers
    const totalOpex = financialVouchers
      .filter((v) => v.type === 'chi' && ['chi_dien_nuoc_3pha', 'chi_thue_mat_bang', 'chi_bao_tri_may'].includes(v.category))
      .reduce((s, v) => s + v.amount, 0);

    const calculatedNetProfit = Math.max(0, calculatedOrderProfit - (totalOpex > 0 ? totalOpex : calculatedOrderProfit * 0.15));

    // Base Profit chosen for jar allocation
    let baseProfit = calculatedOrderProfit;
    if (profitMode === 'net_after_opex') {
      baseProfit = calculatedNetProfit;
    } else if (profitMode === 'custom_input') {
      baseProfit = customProfitInput > 0 ? customProfitInput : calculatedOrderProfit;
    }

    // ----------------------------------------------------
    // UNIFIED SINGLE TABLE CALCULATIONS (100% TOTAL PROFIT)
    // ----------------------------------------------------
    const totalPercent = rateChua + rateDien + rateDauTu + rateDung + rateNhat;

    const amountChua = Math.round(baseProfit * (rateChua / 100));
    const amountDien = Math.round(baseProfit * (rateDien / 100));
    const amountDauTu = Math.round(baseProfit * (rateDauTu / 100));
    const amountDung = Math.round(baseProfit * (rateDung / 100));
    const amountNhat = Math.round(baseProfit * (rateNhat / 100));

    const totalAllocatedAmount = amountChua + amountDien + amountDauTu + amountDung + amountNhat;
    const subtotalFixedJars = amountChua + amountDien + amountDauTu;
    const subtotalPersonnel = amountDung + amountNhat;

    return {
      grossOrderRevenue,
      totalShippingFeeCollected,
      shippingOrdersCount: shippingOrders.length,
      shippingOrders,
      netPrintRevenue,
      totalBlankCost,
      totalMaterialCost,
      filteredScrapCost,
      totalCOGS,
      calculatedOrderProfit,
      calculatedNetProfit,
      baseProfit,
      // Allocation Rates
      rateChua,
      rateDien,
      rateDauTu,
      rateDung,
      rateNhat,
      totalPercent,
      // Allocation Amounts
      amountChua,
      amountDien,
      amountDauTu,
      amountDung,
      amountNhat,
      totalAllocatedAmount,
      subtotalFixedJars,
      subtotalPersonnel,
    };
  }, [
    filteredOrders,
    products,
    defectLogs,
    financialVouchers,
    profitMode,
    customProfitInput,
    rateChua,
    rateDien,
    rateDauTu,
    rateDung,
    rateNhat,
  ]);

  // ----------------------------------------------------------------------
  // 3. COPY ZALO REPORT MESSAGE
  // ----------------------------------------------------------------------
  const handleCopyZaloMessage = () => {
    const periodLabel =
      timeFilter === 'this_month'
        ? 'Tháng 8/2026'
        : timeFilter === 'last_month'
        ? 'Tháng 7/2026'
        : timeFilter === 'this_week'
        ? '7 Ngày Gần Nhất'
        : timeFilter === 'today'
        ? 'Hôm Nay'
        : timeFilter === 'custom'
        ? `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`
        : 'Toàn Bộ Dữ Liệu';

    const message =
      `📊 BẢNG TỔNG KẾT & PHÂN BỔ LỢI NHUẬN XƯỞNG IN 🎁\n` +
      `📅 Kỳ đối soát: ${periodLabel}\n` +
      `📦 Tổng số đơn hàng: ${filteredOrders.length} đơn | 🚚 Đơn có ship: ${calculationSummary.shippingOrdersCount} đơn\n` +
      `----------------------------------------\n` +
      `💰 TỔNG LỢI NHUẬN (100%): ${formatCurrency(calculationSummary.baseProfit)}\n` +
      `(Doanh thu in: ${formatCurrency(calculationSummary.netPrintRevenue)} - Giá vốn & hao hụt: ${formatCurrency(calculationSummary.totalCOGS)})\n\n` +
      `📌 BẢNG PHÂN BỔ LỢI NHUẬN (TỔNG 100%):\n` +
      `1. ✝️ Chúa (${calculationSummary.rateChua}%): ${formatCurrency(calculationSummary.amountChua)}\n` +
      `2. ⚡ Điện (${calculationSummary.rateDien}%): ${formatCurrency(calculationSummary.amountDien)}\n` +
      `3. 💼 Đầu tư (${calculationSummary.rateDauTu}%): ${formatCurrency(calculationSummary.amountDauTu)}\n` +
      `4. 👩 Dung (${calculationSummary.rateDung}%): ${formatCurrency(calculationSummary.amountDung)}\n` +
      `5. 👨 Nhật (${calculationSummary.rateNhat}%): ${formatCurrency(calculationSummary.amountNhat)}\n` +
      `👉 Tổng cộng (${calculationSummary.totalPercent}%): ${formatCurrency(calculationSummary.totalAllocatedAmount)}\n\n` +
      `🚚 QUỸ THU TIỀN SHIP CỦA KHÁCH (LƯU: SHIP):\n` +
      `• Tổng tiền ship đã thu: ${formatCurrency(calculationSummary.totalShippingFeeCollected)} (${calculationSummary.shippingOrdersCount} đơn)\n` +
      `----------------------------------------\n` +
      `Xưởng In Quà Tặng GiftPrint Pro kính báo! ❤️`;

    navigator.clipboard.writeText(message);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 3000);
  };

  // ----------------------------------------------------------------------
  // 4. AUTO-GENERATE 5 FINANCIAL VOUCHERS IN CASHBOOK
  // ----------------------------------------------------------------------
  const handleAutoCreateJarVouchers = () => {
    const timestamp = new Date().toISOString();
    const dateCode = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const rand = Math.floor(100 + Math.random() * 900);

    const vouchersToCreate: FinancialVoucher[] = [
      {
        id: `vc-jar-chua-${Date.now()}-1`,
        voucherCode: `PC-${dateCode}-CHUA${rand}`,
        type: 'chi',
        category: 'chi_chia_hu_chua',
        title: `Trích Quỹ Dâng Chúa (${calculationSummary.rateChua}% Lợi Nhuận)`,
        amount: calculationSummary.amountChua,
        paymentMethod: 'chuyen_khoan',
        date: timestamp,
        recipientOrPayer: 'Tài khoản Quỹ Dâng Chúa',
        performer: 'Hệ Thống Phân Bổ Hũ Tự Động',
        notes: `Trích ${calculationSummary.rateChua}% từ tổng lợi nhuận ${formatCurrency(calculationSummary.baseProfit)}`,
      },
      {
        id: `vc-jar-dien-${Date.now()}-2`,
        voucherCode: `PC-${dateCode}-DIEN${rand}`,
        type: 'chi',
        category: 'chi_chia_hu_dien',
        title: `Trích Quỹ Tiền Điện (${calculationSummary.rateDien}% Lợi Nhuận)`,
        amount: calculationSummary.amountDien,
        paymentMethod: 'chuyen_khoan',
        date: timestamp,
        recipientOrPayer: 'Tài khoản Quỹ Tiền Điện',
        performer: 'Hệ Thống Phân Bổ Hũ Tự Động',
        notes: `Trích ${calculationSummary.rateDien}% từ tổng lợi nhuận ${formatCurrency(calculationSummary.baseProfit)}`,
      },
      {
        id: `vc-jar-dautu-${Date.now()}-3`,
        voucherCode: `PC-${dateCode}-DT${rand}`,
        type: 'chi',
        category: 'chi_chia_hu_dau_tu',
        title: `Trích Quỹ Đầu Tư (${calculationSummary.rateDauTu}% Lợi Nhuận)`,
        amount: calculationSummary.amountDauTu,
        paymentMethod: 'chuyen_khoan',
        date: timestamp,
        recipientOrPayer: 'Tài khoản Quỹ Đầu Tư Xưởng',
        performer: 'Hệ Thống Phân Bổ Hũ Tự Động',
        notes: `Trích ${calculationSummary.rateDauTu}% từ tổng lợi nhuận ${formatCurrency(calculationSummary.baseProfit)}`,
      },
      {
        id: `vc-jar-dung-${Date.now()}-4`,
        voucherCode: `PC-${dateCode}-DUNG${rand}`,
        type: 'chi',
        category: 'chi_chia_loi_nhuan_dung',
        title: `Chi Chia Lợi Nhuận - Nhân Viên Dung (${calculationSummary.rateDung}%)`,
        amount: calculationSummary.amountDung,
        paymentMethod: 'chuyen_khoan',
        date: timestamp,
        recipientOrPayer: 'Nhân viên Dung',
        performer: 'Hệ Thống Phân Bổ Hũ Tự Động',
        notes: `Chia ${calculationSummary.rateDung}% lợi nhuận cho Dung: ${formatCurrency(calculationSummary.amountDung)}`,
      },
      {
        id: `vc-jar-nhat-${Date.now()}-5`,
        voucherCode: `PC-${dateCode}-NHAT${rand}`,
        type: 'chi',
        category: 'chi_chia_loi_nhuan_nhat',
        title: `Chi Chia Lợi Nhuận - Nhân Viên Nhật (${calculationSummary.rateNhat}%)`,
        amount: calculationSummary.amountNhat,
        paymentMethod: 'chuyen_khoan',
        date: timestamp,
        recipientOrPayer: 'Nhân viên Nhật',
        performer: 'Hệ Thống Phân Bổ Hũ Tự Động',
        notes: `Chia ${calculationSummary.rateNhat}% lợi nhuận cho Nhật: ${formatCurrency(calculationSummary.amountNhat)}`,
      },
    ];

    vouchersToCreate.forEach((v) => onAddVoucher(v));
    setVoucherCreatedMessage('Đã tự động tạo 5 Phiếu Chi tương ứng vào Sổ Quỹ Thu Chi!');
    setTimeout(() => setVoucherCreatedMessage(null), 4500);
  };

  // ----------------------------------------------------------------------
  // 5. EXPORT CSV FOR JARS
  // ----------------------------------------------------------------------
  const handleExportJarCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'BẢNG PHÂN BỔ LỢI NHUẬN TỔNG 100% XƯỞNG IN\n';
    csvContent += `Thời gian đối soát:,${timeFilter}\n`;
    csvContent += `Tổng Lợi Nhuận Cơ Sở (100%):,${calculationSummary.baseProfit}\n\n`;

    csvContent += 'BẢNG PHÂN BỔ LỢI NHUẬN 100%\n';
    csvContent += 'STT,Hạng mục,Tỷ lệ %,Công thức / Mục đích,Số tiền (VNĐ)\n';
    csvContent += `1,Chúa,${calculationSummary.rateChua}%,Quỹ Dâng Chúa / Thiện nguyện,${calculationSummary.amountChua}\n`;
    csvContent += `2,Điện,${calculationSummary.rateDien}%,Quỹ tiền điện 3 pha và nước,${calculationSummary.amountDien}\n`;
    csvContent += `3,Đầu tư,${calculationSummary.rateDauTu}%,Quỹ tái đầu tư máy móc & phôi,${calculationSummary.amountDauTu}\n`;
    csvContent += `4,Nhân viên Dung,${calculationSummary.rateDung}%,Chia lợi nhuận cho Dung,${calculationSummary.amountDung}\n`;
    csvContent += `5,Nhân viên Nhật,${calculationSummary.rateNhat}%,Chia lợi nhuận cho Nhật,${calculationSummary.amountNhat}\n`;
    csvContent += `TỔNG CỘNG,,${calculationSummary.totalPercent}%,Tổng 5 khoản phân bổ,${calculationSummary.totalAllocatedAmount}\n\n`;

    csvContent += 'QUỸ THU TIỀN SHIP CỦA KHÁCH (LƯU: SHIP)\n';
    csvContent += `Tổng tiền ship đã thu:,,${calculationSummary.totalShippingFeeCollected}\n`;
    csvContent += 'Mã đơn,Khách hàng,Số điện thoại,Tiền Ship thu (VNĐ),Đơn vị vận chuyển\n';
    calculationSummary.shippingOrders.forEach((o) => {
      csvContent += `"${o.orderCode}","${o.customerName}","${o.customerPhone}",${o.shippingFeeCollected || 35000},"${o.shippingInfo?.carrier || 'Ship'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_Phan_Bo_Loi_Nhuan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* 1. TOP CONTROL BAR: TIME FILTER & PROFIT SOURCE */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <PieIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Bảng Phân Bổ Lợi Nhuận Tổng 100%
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    Chúa 10% • Điện 10% • Đầu tư 10% • Dung 30% • Nhật 40%
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gộp chung 1 bảng gọn gàng: Tổng lợi nhuận 100% chia theo 5 khoản cố định & tùy chỉnh tỉ lệ trực tiếp.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditingRates(!isEditingRates)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors shadow-xs ${
                isEditingRates
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title="Tùy chỉnh tỷ lệ % cho 5 khoản"
            >
              <Sliders className="w-4 h-4" />
              {isEditingRates ? 'Đang Chỉnh Tỷ Lệ %' : 'Tùy Chỉnh Tỷ Lệ %'}
            </button>

            <button
              onClick={handleCopyZaloMessage}
              className="px-3 py-2 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors shadow-xs"
              title="Sao chép bảng phân bổ để gửi Zalo cho Dung & Nhật"
            >
              {copiedZalo ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedZalo ? 'Đã Copy Bảng Zalo!' : 'Copy Gửi Nhóm Zalo'}
            </button>

            <button
              onClick={handleAutoCreateJarVouchers}
              className="px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              title="Tự động ghi 5 Phiếu Chi tương ứng vào Sổ Quỹ Thu Chi"
            >
              <PlusCircle className="w-4 h-4" />
              Lập 5 Phiếu Chi Sổ Quỹ
            </button>

            <button
              onClick={handleExportJarCSV}
              className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* 1. Time Range Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> 1. Khoảng Thời Gian:
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as JarTimeFilter)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 outline-none font-semibold focus:border-blue-500"
            >
              <option value="this_month">Tháng Này (T8/2026)</option>
              <option value="last_month">Tháng Trước (T7/2026)</option>
              <option value="this_week">7 Ngày Gần Nhất</option>
              <option value="today">Hôm Nay</option>
              <option value="custom">Tùy Chọn Ngày (Từ - Đến)</option>
              <option value="all">Toàn Bộ Dữ Liệu</option>
            </select>
          </div>

          {/* 2. Order Scope Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-500" /> 2. Bộ Lọc Đơn Hàng:
            </label>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value as any)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 outline-none font-semibold focus:border-blue-500"
            >
              <option value="all">Tất cả đơn trong kỳ ({filteredOrders.length} đơn)</option>
              <option value="completed_only">Chỉ đơn Đã hoàn tất / Đang giao</option>
              <option value="paid_only">Chỉ đơn Đã thanh toán 100%</option>
            </select>
          </div>

          {/* 3. Profit Calculation Source */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-500" /> 3. Nguồn Tính Lợi Nhuận:
            </label>
            <select
              value={profitMode}
              onChange={(e) => setProfitMode(e.target.value as any)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 outline-none font-semibold focus:border-blue-500"
            >
              <option value="order_gross">Lợi Nhuận Đơn Hàng (Doanh thu in - Giá vốn)</option>
              <option value="net_after_opex">Lợi Nhuận Ròng (Trừ thêm điện, mặt bằng...)</option>
              <option value="custom_input">Tự nhập số tiền Lợi Nhuận thủ công</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker if chosen */}
        {timeFilter === 'custom' && (
          <div className="flex items-center gap-3 p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Chọn khoảng ngày:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1"
            />
            <span className="text-xs text-slate-500">đến</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1"
            />
          </div>
        )}

        {/* Custom Profit Input if chosen */}
        {profitMode === 'custom_input' && (
          <div className="flex items-center gap-3 p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Nhập Tổng Lợi Nhuận mong muốn chia (VNĐ):</span>
            <input
              type="number"
              value={customProfitInput || ''}
              onChange={(e) => setCustomProfitInput(Number(e.target.value))}
              placeholder="VD: 5000000"
              className="text-xs font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-1.5 w-48 text-amber-900 dark:text-amber-200"
            />
          </div>
        )}

        {/* TÙY CHỈNH TỶ LỆ % (INLINE EDITING DRAWER) */}
        {isEditingRates && (
          <div className="p-4 bg-blue-50/70 dark:bg-slate-800/90 rounded-xl border border-blue-200 dark:border-blue-800/60 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Tùy Chỉnh Tỷ Lệ % Của 5 Hũ / Khoản (Tổng = 100%)
              </h4>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    calculationSummary.totalPercent === 100
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  Tổng: {calculationSummary.totalPercent}% {calculationSummary.totalPercent === 100 ? '✓ Chuẩn 100%' : '⚠️ Chưa khớp 100%'}
                </span>
                <button
                  onClick={handleResetDefaultRates}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Mặc định (10-10-10-30-40)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3" /> 1. Chúa (%):
                </label>
                <input
                  type="number"
                  value={rateChua}
                  onChange={(e) => setRateChua(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full text-xs font-black p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center"
                />
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 2. Điện (%):
                </label>
                <input
                  type="number"
                  value={rateDien}
                  onChange={(e) => setRateDien(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full text-xs font-black p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center"
                />
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-violet-700 dark:text-violet-400 mb-1 flex items-center gap-1">
                  <Building className="w-3 h-3" /> 3. Đầu tư (%):
                </label>
                <input
                  type="number"
                  value={rateDauTu}
                  onChange={(e) => setRateDauTu(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full text-xs font-black p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center"
                />
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-pink-700 dark:text-pink-400 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> 4. Dung (%):
                </label>
                <input
                  type="number"
                  value={rateDung}
                  onChange={(e) => setRateDung(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full text-xs font-black p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center"
                />
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-teal-700 dark:text-teal-400 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> 5. Nhật (%):
                </label>
                <input
                  type="number"
                  value={rateNhat}
                  onChange={(e) => setRateNhat(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full text-xs font-black p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* Alert when vouchers are auto-created */}
        {voucherCreatedMessage && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{voucherCreatedMessage}</span>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. SUMMARY METRICS CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Base Profit (100%) */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 rounded-2xl border border-blue-500/40 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Tổng Lợi Nhuận (100%)</span>
            <span className="p-1.5 rounded-lg bg-blue-500/30 text-blue-200">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {formatCurrency(calculationSummary.baseProfit)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-blue-200/80 mt-1">
            <span>{filteredOrders.length} đơn hàng trong kỳ</span>
            <span>Doanh thu in: {formatCurrency(calculationSummary.netPrintRevenue)}</span>
          </div>
        </div>

        {/* Metric 2: Fixed Jars 30% */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              3 Quỹ Trích ({calculationSummary.rateChua + calculationSummary.rateDien + calculationSummary.rateDauTu}%)
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {formatCurrency(calculationSummary.subtotalFixedJars)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Chúa ({calculationSummary.rateChua}%) + Điện ({calculationSummary.rateDien}%) + Đầu tư ({calculationSummary.rateDauTu}%)
          </p>
        </div>

        {/* Metric 3: Personnel Profit Share 70% */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Chia Lợi Nhuận ({calculationSummary.rateDung + calculationSummary.rateNhat}%)
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(calculationSummary.subtotalPersonnel)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Dung: {formatCurrency(calculationSummary.amountDung)} ({calculationSummary.rateDung}%) | Nhật: {formatCurrency(calculationSummary.amountNhat)} ({calculationSummary.rateNhat}%)
          </p>
        </div>

        {/* Metric 4: Shipping Fund (Lưu tiền Ship riêng) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Quỹ Thu Ship Khách
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Lưu: Ship
            </span>
          </div>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-2">
            {formatCurrency(calculationSummary.totalShippingFeeCollected)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {calculationSummary.shippingOrdersCount} đơn thu cước (tách riêng, không tính vào LN in)
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. MAIN UNIFIED TABLE (GỘP CHUNG 1 BẢNG DUY NHẤT) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Header Styled as Excel */}
        <div className="bg-[#2b4c7e] text-white p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-300" />
                BẢNG PHÂN BỔ LỢI NHUẬN TỔNG 100%
              </h4>
              <p className="text-[11px] text-blue-200 mt-0.5">
                Cơ sở: <strong>{formatCurrency(calculationSummary.baseProfit)}</strong> (Tổng Lợi Nhuận 100% từ các đơn hàng)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-lg bg-white/20 font-black">
                Tổng 5 Khoản: {calculationSummary.totalPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#3b5998] text-white font-bold border-b border-blue-900">
                <th className="py-2.5 px-3 text-center w-12 border-r border-blue-900/40">STT</th>
                <th className="py-2.5 px-4 border-r border-blue-900/40">Hạng mục phân bổ</th>
                <th className="py-2.5 px-3 border-r border-blue-900/40 text-center w-24">Tỷ lệ %</th>
                <th className="py-2.5 px-4 border-r border-blue-900/40">Công thức / Mục đích sử dụng</th>
                <th className="py-2.5 px-4 text-right font-black w-44">Số tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Row 1: Chúa (10%) */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="py-3 px-3 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800">
                  1
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                      <HeartHandshake className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-bold">Chúa</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Quỹ Dâng Chúa / Thiện nguyện</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
                  {calculationSummary.rateChua}%
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {calculationSummary.rateChua}% Tổng Lợi Nhuận
                </td>
                <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                  {formatCurrency(calculationSummary.amountChua)}
                </td>
              </tr>

              {/* Row 2: Điện (10%) */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="py-3 px-3 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800">
                  2
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                      <Zap className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-bold">Điện</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Quỹ tiền điện 3 pha xưởng ép nhiệt & máy in</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-black text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30">
                  {calculationSummary.rateDien}%
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {calculationSummary.rateDien}% Tổng Lợi Nhuận
                </td>
                <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                  {formatCurrency(calculationSummary.amountDien)}
                </td>
              </tr>

              {/* Row 3: Đầu tư (10%) */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="py-3 px-3 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800">
                  3
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600">
                      <Building className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-bold">Đầu tư</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Quỹ mua khuôn mới, nâng cấp máy & phôi</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-black text-violet-700 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/30">
                  {calculationSummary.rateDauTu}%
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {calculationSummary.rateDauTu}% Tổng Lợi Nhuận
                </td>
                <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                  {formatCurrency(calculationSummary.amountDauTu)}
                </td>
              </tr>

              {/* Row 4: Dung (30%) */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="py-3 px-3 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800">
                  4
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 flex items-center justify-center font-black text-xs">
                      D
                    </div>
                    <div>
                      <span className="font-bold text-pink-900 dark:text-pink-200">Nhân viên tên Dung</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Phụ trách Thiết kế, Tư vấn & Chăm sóc khách</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-black text-pink-700 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-950/30">
                  {calculationSummary.rateDung}%
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {calculationSummary.rateDung}% Tổng Lợi Nhuận
                </td>
                <td className="py-3 px-4 text-right font-black text-pink-600 dark:text-pink-400 text-base">
                  {formatCurrency(calculationSummary.amountDung)}
                </td>
              </tr>

              {/* Row 5: Nhật (40%) */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="py-3 px-3 text-center font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800">
                  5
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black text-xs">
                      N
                    </div>
                    <div>
                      <span className="font-bold text-teal-900 dark:text-teal-200">Nhân viên tên Nhật</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Phụ trách Kỹ thuật In ấn & Quản lý Xưởng</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-black text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30">
                  {calculationSummary.rateNhat}%
                </td>
                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {calculationSummary.rateNhat}% Tổng Lợi Nhuận
                </td>
                <td className="py-3 px-4 text-right font-black text-teal-600 dark:text-teal-400 text-base">
                  {formatCurrency(calculationSummary.amountNhat)}
                </td>
              </tr>

              {/* TOTAL ROW (100%) */}
              <tr className="bg-blue-50/80 dark:bg-blue-950/60 font-bold text-slate-900 dark:text-white border-t-2 border-blue-400 dark:border-blue-700">
                <td className="py-3.5 px-3 text-center border-r border-slate-200 dark:border-slate-800">
                  ★
                </td>
                <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 font-black text-sm uppercase">
                  TỔNG CỘNG PHÂN BỔ
                </td>
                <td className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-black text-blue-800 dark:text-blue-300 text-sm">
                  {calculationSummary.totalPercent}%
                </td>
                <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Tổng 5 khoản (Chúa + Điện + Đầu tư + Dung + Nhật)
                </td>
                <td className="py-3.5 px-4 text-right font-black text-blue-700 dark:text-blue-300 text-lg">
                  {formatCurrency(calculationSummary.totalAllocatedAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer Actions & Status */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              Tỷ lệ chuẩn: Chúa 10% | Điện 10% | Đầu tư 10% | Dung 30% | Nhật 40% (Tổng = 100%)
            </span>
          </div>

          <button
            onClick={() => setIsEditingRates(!isEditingRates)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            {isEditingRates ? 'Đóng Bảng Tùy Chỉnh' : 'Mở Tùy Chỉnh Tỉ Lệ %'}
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. SHIP MANAGEMENT SECTION (QUỸ TIỀN SHIP CỦA KHÁCH) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Quỹ Tiền Ship Khách Hàng (Tách Biệt Lợi Nhuận In)
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Lưu: Ship
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Nếu đơn hàng nào thu tiền ship của khách thì được ghi nhận riêng vào mục Ship để không làm sai lệch lợi nhuận sản xuất.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Tổng Tiền Thu Ship:</span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(calculationSummary.totalShippingFeeCollected)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold">
                <th className="py-2.5 px-4">Mã Đơn Hàng</th>
                <th className="py-2.5 px-4">Khách Hàng / Đơn Vị</th>
                <th className="py-2.5 px-4">Địa Chỉ Giao Hàng</th>
                <th className="py-2.5 px-4 text-center">Đơn Vị Giao</th>
                <th className="py-2.5 px-4 text-right">Tiền Ship Thu Khách</th>
                <th className="py-2.5 px-4 text-center">Trạng Thái Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {calculationSummary.shippingOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Chưa có đơn hàng phát sinh cước ship trong khoảng thời gian này.
                  </td>
                </tr>
              ) : (
                calculationSummary.shippingOrders.map((ord) => {
                  const shipFee = ord.shippingFeeCollected || (ord.shippingInfo?.carrier === 'ahamove' ? 35000 : 30000);
                  return (
                    <tr
                      key={ord.id}
                      onClick={() => onSelectOrder && onSelectOrder(ord)}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {ord.orderCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {ord.customerCompany || ord.customerName}
                        </span>
                        <span className="block text-[11px] text-slate-400">{ord.customerPhone}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {ord.shippingAddress || 'Nhận tại xưởng'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {ord.shippingInfo?.carrier || 'Ship Tự Do'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-700 dark:text-blue-300">
                        {formatCurrency(shipFee)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          ✓ Đã Lưu: Ship
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
