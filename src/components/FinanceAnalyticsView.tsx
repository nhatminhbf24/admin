import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  Receipt,
  PlusCircle,
  Download,
  Printer,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Phone,
  FileText,
  Copy,
  Check,
  QrCode,
  Flame,
  Image as ImageIcon,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  X,
  Send,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import {
  Order,
  GiftProduct,
  MaterialInventory,
  DefectLog,
  FinancialVoucher,
  FinancialCategory,
  FinancialVoucherType,
  FinancialPaymentMethod,
  PaymentStatus,
  ProductProfitabilityMetric,
} from '../types';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  getFinancialCategoryInfo,
  getPaymentStatusInfo,
} from '../utils/formatters';
import { FinancialJarSplitView } from './FinancialJarSplitView';

interface FinanceAnalyticsViewProps {
  orders: Order[];
  products: GiftProduct[];
  materials: MaterialInventory[];
  defectLogs: DefectLog[];
  financialVouchers: FinancialVoucher[];
  onAddVoucher: (voucher: FinancialVoucher) => void;
  onUpdateOrderStatus?: (orderId: string, status: any) => void;
  onUpdatePaymentStatus: (orderId: string, newPaymentStatus: PaymentStatus, depositAmount?: number) => void;
  onSelectOrder?: (order: Order) => void;
  onOpenVietQrModal: (order: Order, amount?: number) => void;
}

type FinanceTab = 'overview' | 'profit_jars' | 'vouchers' | 'receivables' | 'product_profit' | 'scrap_analytics';
type TimePeriod = 'all' | 'today' | 'this_week' | 'this_month' | 'last_month';

export const FinanceAnalyticsView: React.FC<FinanceAnalyticsViewProps> = ({
  orders,
  products,
  materials,
  defectLogs,
  financialVouchers,
  onAddVoucher,
  onUpdatePaymentStatus,
  onSelectOrder,
  onOpenVietQrModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<FinanceTab>('overview');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('this_month');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Voucher filter states
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<'all' | 'thu' | 'chi'>('all');
  const [voucherCategoryFilter, setVoucherCategoryFilter] = useState<string>('all');
  const [voucherPaymentMethodFilter, setVoucherPaymentMethodFilter] = useState<'all' | 'tien_mat' | 'chuyen_khoan'>('all');

  // Modal States
  const [isNewVoucherModalOpen, setIsNewVoucherModalOpen] = useState<boolean>(false);
  const [selectedVoucherForDetail, setSelectedVoucherForDetail] = useState<FinancialVoucher | null>(null);
  const [copiedDebtOrderId, setCopiedDebtOrderId] = useState<string | null>(null);
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState<boolean>(false);

  // New Voucher Form State
  const [newVoucherData, setNewVoucherData] = useState<{
    type: FinancialVoucherType;
    category: FinancialCategory;
    title: string;
    amount: number;
    paymentMethod: FinancialPaymentMethod;
    recipientOrPayer: string;
    performer: string;
    orderId?: string;
    notes?: string;
  }>({
    type: 'chi',
    category: 'chi_dien_nuoc_3pha',
    title: '',
    amount: 0,
    paymentMethod: 'chuyen_khoan',
    recipientOrPayer: '',
    performer: 'Vũ Thu Thảo (Kế toán xưởng)',
    orderId: '',
    notes: '',
  });

  // ----------------------------------------------------
  // 1. FINANCIAL CALCULATIONS & P&L METRICS
  // ----------------------------------------------------
  const financialMetrics = useMemo(() => {
    // Total order revenue
    const totalOrderRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);

    // Actual collected money from orders
    const totalCollectedFromOrders = orders.reduce((sum, ord) => {
      if (ord.paymentStatus === 'da_tat_toan') return sum + ord.totalAmount;
      if (ord.paymentStatus === 'da_coc_50') return sum + ord.depositAmount;
      return sum;
    }, 0);

    // Accounts receivable from orders (uncollected balance)
    const accountsReceivable = orders.reduce((sum, ord) => {
      if (ord.paymentStatus === 'da_tat_toan') return sum;
      if (ord.paymentStatus === 'da_coc_50') return sum + Math.max(0, ord.totalAmount - ord.depositAmount);
      return sum + ord.totalAmount;
    }, 0);

    // Total vouchers: Thu & Chi
    const totalVoucherThu = financialVouchers
      .filter((v) => v.type === 'thu')
      .reduce((sum, v) => sum + v.amount, 0);

    const totalVoucherChi = financialVouchers
      .filter((v) => v.type === 'chi')
      .reduce((sum, v) => sum + v.amount, 0);

    // Breakdown of Expenses by Category
    const expenseBreakdown = {
      phoi: financialVouchers.filter((v) => v.category === 'chi_nhap_phoi').reduce((s, v) => s + v.amount, 0),
      vatTuMuc: financialVouchers.filter((v) => v.category === 'chi_nhap_vat_tu_muc').reduce((s, v) => s + v.amount, 0),
      dienNuoc: financialVouchers.filter((v) => v.category === 'chi_dien_nuoc_3pha').reduce((s, v) => s + v.amount, 0),
      matBang: financialVouchers.filter((v) => v.category === 'chi_thue_mat_bang').reduce((s, v) => s + v.amount, 0),
      luongTho: financialVouchers.filter((v) => v.category === 'chi_luong_tho_in').reduce((s, v) => s + v.amount, 0),
      baoTri: financialVouchers.filter((v) => v.category === 'chi_bao_tri_may').reduce((s, v) => s + v.amount, 0),
      vanChuyen: financialVouchers.filter((v) => v.category === 'chi_van_chuyen_ship').reduce((s, v) => s + v.amount, 0),
      haoHut: defectLogs.reduce((s, d) => s + d.estimatedCostLoss, 0),
      khac: financialVouchers.filter((v) => v.category === 'chi_khac').reduce((s, v) => s + v.amount, 0),
    };

    // Calculate Cost of Goods Sold (COGS: Phôi + Vật tư in ước tính)
    let estimatedTotalBlankCost = 0;
    let estimatedTotalMaterialCost = 0;

    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        const prod = products.find((p) => p.sku === item.sku || p.name === item.productName);
        const blankCost = prod?.basePrice || item.unitPrice * 0.45;
        estimatedTotalBlankCost += blankCost * item.quantity;
        // Estimated print ink/paper/film cost per unit (average ~4,000 - 8,000đ)
        estimatedTotalMaterialCost += (item.printPricePerUnit || 6000) * item.quantity;
      });
    });

    const totalScrapLoss = defectLogs.reduce((sum, d) => sum + d.estimatedCostLoss, 0);

    // Total COGS = Blank Cost + Print Material Cost + Scrap Loss
    const totalCOGS = estimatedTotalBlankCost + estimatedTotalMaterialCost + totalScrapLoss;

    // Gross Profit (Lợi Nhuận Gộp) = Total Revenue - COGS
    const grossProfit = totalOrderRevenue - totalCOGS;
    const grossMarginPercent = totalOrderRevenue > 0 ? (grossProfit / totalOrderRevenue) * 100 : 0;

    // Operating Expenses (OPEX: Điện + Mặt bằng + Lương + Bảo trì + Ship + Khác)
    const opex =
      expenseBreakdown.dienNuoc +
      expenseBreakdown.matBang +
      expenseBreakdown.luongTho +
      expenseBreakdown.baoTri +
      expenseBreakdown.vanChuyen +
      expenseBreakdown.khac;

    // Net Operating Profit (Lợi Nhuận Ròng Thực Tế) = Gross Profit - OPEX
    const netProfit = grossProfit - opex;
    const netMarginPercent = totalOrderRevenue > 0 ? (netProfit / totalOrderRevenue) * 100 : 0;

    // Cash balance in fund (Tồn quỹ thực tế = Thu - Chi)
    const netFundCashflow = totalVoucherThu - totalVoucherChi;

    return {
      totalOrderRevenue,
      totalCollectedFromOrders,
      accountsReceivable,
      totalVoucherThu,
      totalVoucherChi,
      netFundCashflow,
      expenseBreakdown,
      estimatedTotalBlankCost,
      estimatedTotalMaterialCost,
      totalScrapLoss,
      totalCOGS,
      grossProfit,
      grossMarginPercent,
      opex,
      netProfit,
      netMarginPercent,
    };
  }, [orders, products, materials, defectLogs, financialVouchers]);

  // ----------------------------------------------------
  // 2. PRODUCT PROFITABILITY METRICS
  // ----------------------------------------------------
  const productProfitabilityList = useMemo<ProductProfitabilityMetric[]>(() => {
    return products.map((prod) => {
      let totalSoldQty = 0;
      let totalRevenue = 0;

      orders.forEach((ord) => {
        ord.items.forEach((item) => {
          if (item.sku === prod.sku || item.productName === prod.name) {
            totalSoldQty += item.quantity;
            totalRevenue += (item.unitPrice + (item.printPricePerUnit || 0)) * item.quantity;
          }
        });
      });

      // Blank cost
      const totalBaseCost = prod.basePrice * totalSoldQty;

      // Estimated ink/paper/film per unit
      const unitMaterialEstimate = prod.serviceGroup === 'chuyen_nhiet' ? 5500 : 4000;
      const totalPrintMaterialCost = unitMaterialEstimate * totalSoldQty;

      // Scrap logs for this product
      const productDefects = defectLogs.filter((d) => d.productId === prod.id || d.sku === prod.sku);
      const defectCount = productDefects.reduce((s, d) => s + d.quantityScrapped, 0);
      const totalScrapCost = productDefects.reduce((s, d) => s + d.estimatedCostLoss, 0);

      // COGS
      const totalCOGS = totalBaseCost + totalPrintMaterialCost + totalScrapCost;
      const grossProfit = totalRevenue - totalCOGS;
      const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const avgSellingPrice = totalSoldQty > 0 ? totalRevenue / totalSoldQty : prod.basePrice * 2.2;
      const avgCostPerUnit = totalSoldQty > 0 ? totalCOGS / totalSoldQty : prod.basePrice + unitMaterialEstimate;
      const totalProduced = totalSoldQty + defectCount;
      const scrapRate = totalProduced > 0 ? (defectCount / totalProduced) * 100 : 0;

      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        category: prod.category,
        serviceGroup: prod.serviceGroup,
        totalSoldQty,
        totalRevenue,
        totalBaseCost,
        totalPrintMaterialCost,
        totalScrapCost,
        totalCOGS,
        grossProfit,
        grossMarginPercent,
        avgSellingPrice,
        avgCostPerUnit,
        defectCount,
        scrapRate,
      };
    });
  }, [products, orders, defectLogs]);

  // ----------------------------------------------------
  // 3. UNPAID / DEBT ORDERS LIST
  // ----------------------------------------------------
  const debtOrders = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus !== 'da_tat_toan')
      .map((o) => {
        const remainingDebt =
          o.paymentStatus === 'da_coc_50'
            ? Math.max(0, o.totalAmount - o.depositAmount)
            : o.totalAmount;
        return {
          ...o,
          remainingDebt,
        };
      })
      .sort((a, b) => b.remainingDebt - a.remainingDebt);
  }, [orders]);

  // ----------------------------------------------------
  // 4. FILTERED FINANCIAL VOUCHERS
  // ----------------------------------------------------
  const filteredVouchers = useMemo(() => {
    return financialVouchers.filter((v) => {
      if (voucherTypeFilter !== 'all' && v.type !== voucherTypeFilter) return false;
      if (voucherCategoryFilter !== 'all' && v.category !== voucherCategoryFilter) return false;
      if (voucherPaymentMethodFilter !== 'all' && v.paymentMethod !== voucherPaymentMethodFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchCode = v.voucherCode.toLowerCase().includes(q);
        const matchTitle = v.title.toLowerCase().includes(q);
        const matchName = v.recipientOrPayer.toLowerCase().includes(q);
        const matchOrder = v.orderCode?.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchName && !matchOrder) return false;
      }
      return true;
    });
  }, [financialVouchers, voucherTypeFilter, voucherCategoryFilter, voucherPaymentMethodFilter, searchQuery]);

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------

  // Quick 1-Click Settle Debt for an Order
  const handleQuickSettleOrder = (order: Order) => {
    const remaining = Math.max(0, order.totalAmount - (order.depositAmount || 0));
    onUpdatePaymentStatus(order.id, 'da_tat_toan', order.totalAmount);

    // Auto generate a Receipt Voucher (Phiếu Thu)
    const newVoucher: FinancialVoucher = {
      id: `vc-auto-${Date.now()}`,
      voucherCode: `PT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'thu',
      category: 'thu_tat_toan',
      title: `Thu tất toán 100% đơn hàng ${order.orderCode} (${order.customerCompany || order.customerName})`,
      amount: remaining,
      paymentMethod: 'chuyen_khoan',
      date: new Date().toISOString(),
      orderId: order.id,
      orderCode: order.orderCode,
      customerId: order.customerPhone,
      customerName: order.customerCompany || order.customerName,
      recipientOrPayer: order.customerCompany || order.customerName,
      performer: 'Vũ Thu Thảo (Kế toán xưởng)',
      notes: `Hệ thống tự động ghi nhận phiếu thu khi tất toán đơn hàng ${order.orderCode}`,
    };

    onAddVoucher(newVoucher);
  };

  // Quick 1-Click Collect 50% Deposit for an Order
  const handleQuickDepositOrder = (order: Order) => {
    const depositAmount = Math.round(order.totalAmount * 0.5);
    onUpdatePaymentStatus(order.id, 'da_coc_50', depositAmount);

    const newVoucher: FinancialVoucher = {
      id: `vc-auto-${Date.now()}`,
      voucherCode: `PT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'thu',
      category: 'thu_tien_coc',
      title: `Thu 50% tiền cọc đơn hàng ${order.orderCode} (${order.customerCompany || order.customerName})`,
      amount: depositAmount,
      paymentMethod: 'chuyen_khoan',
      date: new Date().toISOString(),
      orderId: order.id,
      orderCode: order.orderCode,
      customerId: order.customerPhone,
      customerName: order.customerCompany || order.customerName,
      recipientOrPayer: order.customerCompany || order.customerName,
      performer: 'Vũ Thu Thảo (Kế toán xưởng)',
      notes: `Thu cọc 50% bắt đầu chế bản và sản xuất đơn hàng ${order.orderCode}`,
    };

    onAddVoucher(newVoucher);
  };

  // Copy Polite Zalo Debt Reminder Message
  const handleCopyDebtMessage = (e: React.MouseEvent, ord: Order & { remainingDebt: number }) => {
    e.stopPropagation();
    const message = `Dạ xưởng in quà tặng GiftPrint Pro kính chào quý khách ${ord.customerCompany || ord.customerName}! 🌸\n\n` +
      `Đơn hàng [${ord.orderCode}] của quý khách (${ord.items[0]?.productName || 'Hàng in ấn quà tặng'}) ` +
      `đang được hoàn thiện theo tiến độ giao ngày ${formatDate(ord.deadline)}.\n` +
      `• Tổng giá trị đơn: ${formatCurrency(ord.totalAmount)}\n` +
      `• Đã cọc: ${formatCurrency(ord.depositAmount)}\n` +
      `👉 Số tiền còn lại cần thanh toán: ${formatCurrency(ord.remainingDebt)}\n\n` +
      `Quý khách vui lòng chuyển khoản qua tài khoản xưởng:\n` +
      `🏦 Ngân Hàng MB Bank - STK: 0988776655 - CTK: NGUYEN VAN TUAN\n` +
      `📝 Nội dung CK: ${ord.orderCode} ${ord.customerPhone}\n\n` +
      `Xưởng xin chân thành cảm ơn quý khách! ❤️`;

    navigator.clipboard.writeText(message);
    setCopiedDebtOrderId(ord.id);
    setTimeout(() => setCopiedDebtOrderId(null), 2500);
  };

  // Submit New Manual Voucher
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherData.title.trim() || newVoucherData.amount <= 0) return;

    const prefix = newVoucherData.type === 'thu' ? 'PT' : 'PC';
    const monthStr = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const randomCode = Math.floor(100 + Math.random() * 900);

    const createdVoucher: FinancialVoucher = {
      id: `vc-manual-${Date.now()}`,
      voucherCode: `${prefix}-${monthStr}-${randomCode}`,
      type: newVoucherData.type,
      category: newVoucherData.category,
      title: newVoucherData.title,
      amount: Number(newVoucherData.amount),
      paymentMethod: newVoucherData.paymentMethod,
      date: new Date().toISOString(),
      recipientOrPayer: newVoucherData.recipientOrPayer || (newVoucherData.type === 'thu' ? 'Khách hàng' : 'Nhà cung cấp / Đối tác'),
      performer: newVoucherData.performer,
      orderId: newVoucherData.orderId || undefined,
      notes: newVoucherData.notes,
    };

    onAddVoucher(createdVoucher);
    setIsNewVoucherModalOpen(false);

    // Reset
    setNewVoucherData({
      type: 'chi',
      category: 'chi_dien_nuoc_3pha',
      title: '',
      amount: 0,
      paymentMethod: 'chuyen_khoan',
      recipientOrPayer: '',
      performer: 'Vũ Thu Thảo (Kế toán xưởng)',
      orderId: '',
      notes: '',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'MÃ PHIẾU,LOẠI,DANH MỤC,TIÊU ĐỀ,SỐ TIỀN (VNĐ),HÌNH THỨC,NGÀY LẬP,NGƯỜI NHẬN/NỘP,NGƯỜI LẬP,GHI CHÚ\n';

    financialVouchers.forEach((v) => {
      const catInfo = getFinancialCategoryInfo(v.category);
      const row = [
        `"${v.voucherCode}"`,
        `"${v.type.toUpperCase()}"`,
        `"${catInfo.label}"`,
        `"${v.title.replace(/"/g, '""')}"`,
        v.amount,
        `"${v.paymentMethod === 'chuyen_khoan' ? 'Chuyển khoản' : 'Tiền mặt'}"`,
        `"${formatDateTime(v.date)}"`,
        `"${v.recipientOrPayer || ''}"`,
        `"${v.performer || ''}"`,
        `"${(v.notes || '').replace(/"/g, '""')}"`,
      ];
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `So_Quy_Thu_Chi_GiftPrint_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* 1. HEADER & TOP ACTION TOOLBAR */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Tài Chính, Thu Chi & Báo Cáo Lợi Nhuận
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  P&L Real-time
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quản lý dòng tiền xưởng in, theo dõi công nợ đơn hàng, biên lợi nhuận từng sản phẩm và chi phí hao hụt.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewVoucherModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Lập Phiếu Thu / Chi
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Xuất file Excel Sổ Quỹ Thu Chi & Dòng Tiền"
          >
            <Download className="w-4 h-4 text-slate-500" /> Xuất Excel Sổ Quỹ
          </button>

          <button
            onClick={() => setIsPrintReportModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            title="In Báo Cáo Tài Chính Xưởng A4"
          >
            <Printer className="w-4 h-4 text-slate-500" /> In Báo Cáo P&L
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Tổng Quan P&L & Dòng Tiền
          </button>

          <button
            onClick={() => setActiveSubTab('profit_jars')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'profit_jars'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PieIcon className="w-4 h-4" /> Chia Hũ Tài Chính & Lợi Nhuận
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Mới
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('vouchers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'vouchers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" /> Sổ Quỹ Thu Chi ({financialVouchers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('receivables')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'receivables'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Công Nợ Đơn Hàng
            {debtOrders.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSubTab === 'receivables' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                {debtOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('product_profit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'product_profit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Biên Lợi Nhuận Sản Phẩm
          </button>

          <button
            onClick={() => setActiveSubTab('scrap_analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'scrap_analytics'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Chi Phí Hao Hụt ({defectLogs.length})
          </button>
        </div>

        {/* Time Period Filter */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 outline-none font-medium"
          >
            <option value="this_month">Tháng Này (T8/2026)</option>
            <option value="this_week">7 Ngày Gần Nhất</option>
            <option value="today">Hôm Nay</option>
            <option value="all">Toàn Bộ Dữ Liệu</option>
          </select>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & P&L DASHBOARD */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 5 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Total Revenue */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Doanh Thu</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                {formatCurrency(financialMetrics.totalOrderRevenue)}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>{orders.length} đơn hàng sản xuất</span>
              </div>
            </div>

            {/* 2. Actual Collected Money */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đã Thực Thu (Tiền Vào)</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {formatCurrency(financialMetrics.totalCollectedFromOrders)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {(
                  (financialMetrics.totalCollectedFromOrders / (financialMetrics.totalOrderRevenue || 1)) *
                  100
                ).toFixed(1)}
                % tổng giá trị đơn
              </p>
            </div>

            {/* 3. Accounts Receivable (Debt) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Công Nợ Phải Thu</span>
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-2">
                {formatCurrency(financialMetrics.accountsReceivable)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {debtOrders.length} đơn chưa tất toán đủ
              </p>
            </div>

            {/* 4. Total Operating Expenses + COGS */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Chi Phí Xưởng</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                {formatCurrency(financialMetrics.totalCOGS + financialMetrics.opex)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Hao hụt phôi: {formatCurrency(financialMetrics.totalScrapLoss)}
              </p>
            </div>

            {/* 5. Net Profit & Margin */}
            <div className="bg-gradient-to-br from-emerald-900/40 via-teal-950/40 to-slate-900 p-4 rounded-2xl border border-emerald-500/30 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300">Lợi Nhuận Ròng (Net)</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {financialMetrics.netMarginPercent.toFixed(1)}% Margin
                </span>
              </div>
              <p className="text-lg font-bold text-emerald-400 mt-2">
                {formatCurrency(financialMetrics.netProfit)}
              </p>
              <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Biên gộp: {financialMetrics.grossMarginPercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Detailed P&L Statement and Cost Structure Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Formal P&L Statement (Báo Cáo Kết Quả Kinh Doanh Xưởng In) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Báo Cáo Kết Quả Kinh Doanh Xưởng (P&L Statement)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hạch toán chi tiết doanh thu, giá vốn, hao hụt và chi phí vận hành.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Tháng 8/2026
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* 1. Revenue */}
                <div className="flex items-center justify-between p-2.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl font-bold text-blue-900 dark:text-blue-200">
                  <span>1. DOANH THU ĐƠN HÀNG IN ẤN (REVENUE)</span>
                  <span>{formatCurrency(financialMetrics.totalOrderRevenue)}</span>
                </div>

                {/* 2. COGS Items */}
                <div className="pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span>(-) Giá vốn phôi quà tặng (Ly sứ, áo, bình, đá, phôi móc khóa)</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(financialMetrics.estimatedTotalBlankCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span>(-) Chi phí mực in Sublimation, decal, giấy in & màng cán</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(financialMetrics.estimatedTotalMaterialCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> (-) Chi phí hao hụt hỏng phôi in ấn (Defect Waste)
                    </span>
                    <span className="font-semibold">{formatCurrency(financialMetrics.totalScrapLoss)}</span>
                  </div>
                </div>

                {/* 3. Gross Profit */}
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 dark:bg-emerald-950/50 rounded-xl font-bold text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <span>2. LỢI NHUẬN GỘP XƯỞNG (GROSS PROFIT)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      Biên gộp: {financialMetrics.grossMarginPercent.toFixed(1)}%
                    </span>
                  </div>
                  <span>{formatCurrency(financialMetrics.grossProfit)}</span>
                </div>

                {/* 4. OPEX Items */}
                <div className="pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span>(-) Tiền điện 3 pha & nước vận hành máy xưởng</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(financialMetrics.expenseBreakdown.dienNuoc)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span>(-) Chi phí thuê mặt bằng xưởng in & showroom</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(financialMetrics.expenseBreakdown.matBang)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span>(-) Lương & phụ cấp thợ in / thợ thiết kế</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(financialMetrics.expenseBreakdown.luongTho)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span>(-) Bảo trì máy móc, thay khuôn cao su ép ly & đầu phun</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(financialMetrics.expenseBreakdown.baoTri)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span>(-) Cước vận chuyển & giao hàng hỏa tốc Ahamove/GHTK</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(financialMetrics.expenseBreakdown.vanChuyen)}
                    </span>
                  </div>
                </div>

                {/* 5. Net Operating Profit */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl font-bold text-white shadow-sm mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">3. LỢI NHUẬN RÒNG THỰC TẾ (NET PROFIT)</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                      {financialMetrics.netMarginPercent.toFixed(1)}% Net Margin
                    </span>
                  </div>
                  <span className="text-base">{formatCurrency(financialMetrics.netProfit)}</span>
                </div>

                {/* Quick Link to 6 Financial Jars Allocation */}
                <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <PieIcon className="w-3.5 h-3.5 text-blue-600" />
                      Phân Bổ Hũ Tài Chính & Lợi Nhuận (Đầu tư, Điện, Chúa, Dung, Nhật)
                    </h4>
                    <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                      Tự động trích 30% quỹ cố định & chia 70% lợi nhuận còn lại kèm quản lý quỹ Ship.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('profit_jars')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                  >
                    Xem Bảng Chia Hũ <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Cost Breakdown Visuals & Cashflow Fund */}
            <div className="lg:col-span-5 space-y-6">
              {/* Cost Structure Breakdown Bars */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <PieIcon className="w-4 h-4 text-emerald-600" />
                  Cơ Cấu Chi Phí Hoạt Động Xưởng
                </h3>

                <div className="space-y-3">
                  {/* Item 1: Phôi */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Giá vốn phôi quà tặng</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(financialMetrics.estimatedTotalBlankCost)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (financialMetrics.estimatedTotalBlankCost /
                              (financialMetrics.totalCOGS + financialMetrics.opex || 1)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Item 2: Thuê Mặt Bằng */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Thuê mặt bằng xưởng</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(financialMetrics.expenseBreakdown.matBang)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (financialMetrics.expenseBreakdown.matBang /
                              (financialMetrics.totalCOGS + financialMetrics.opex || 1)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Item 3: Lương Thợ */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Lương thợ in & gia công</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(financialMetrics.expenseBreakdown.luongTho)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (financialMetrics.expenseBreakdown.luongTho /
                              (financialMetrics.totalCOGS + financialMetrics.opex || 1)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Item 4: Tiền Điện 3 Pha */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Điện 3 pha & vật tư</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(
                          financialMetrics.expenseBreakdown.dienNuoc + financialMetrics.estimatedTotalMaterialCost
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((financialMetrics.expenseBreakdown.dienNuoc +
                              financialMetrics.estimatedTotalMaterialCost) /
                              (financialMetrics.totalCOGS + financialMetrics.opex || 1)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Item 5: Hao Hụt Hỏng Phôi */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-rose-600 dark:text-rose-400">Chi phí hao hụt / hỏng phôi</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(financialMetrics.totalScrapLoss)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (financialMetrics.totalScrapLoss /
                              (financialMetrics.totalCOGS + financialMetrics.opex || 1)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fund Cashflow Summary Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">Sổ Quỹ Tiền Mặt & Ngân Hàng</span>
                  <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <p className="text-[11px] text-emerald-400 font-medium">Tổng Phiếu Thu (+)</p>
                    <p className="text-base font-bold text-white mt-0.5">
                      {formatCurrency(financialMetrics.totalVoucherThu)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-rose-400 font-medium">Tổng Phiếu Chi (-)</p>
                    <p className="text-base font-bold text-white mt-0.5">
                      {formatCurrency(financialMetrics.totalVoucherChi)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tồn Quỹ Thực Tế:</span>
                  <span
                    className={`font-bold text-sm ${
                      financialMetrics.netFundCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(financialMetrics.netFundCashflow)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: PHÂN BỔ HŨ TÀI CHÍNH & CHIA LỢI NHUẬN */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'profit_jars' && (
        <FinancialJarSplitView
          orders={orders}
          products={products}
          defectLogs={defectLogs}
          financialVouchers={financialVouchers}
          onAddVoucher={onAddVoucher}
          onSelectOrder={onSelectOrder}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: SỔ QUỸ THU CHI & VOUCHERS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'vouchers' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã phiếu (PT/PC), tiêu đề, tên người nhận/nộp..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={voucherTypeFilter}
                onChange={(e) => setVoucherTypeFilter(e.target.value as any)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 outline-none font-medium"
              >
                <option value="all">Tất cả loại phiếu</option>
                <option value="thu">✓ Phiếu Thu (+)</option>
                <option value="chi">⚠️ Phiếu Chi (-)</option>
              </select>

              {/* Category Filter */}
              <select
                value={voucherCategoryFilter}
                onChange={(e) => setVoucherCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 outline-none font-medium"
              >
                <option value="all">Tất cả danh mục thu chi</option>
                <option value="thu_tien_coc">Thu Tiền Cọc Đơn Hàng</option>
                <option value="thu_tat_toan">Thu Tất Toán / COD</option>
                <option value="thu_cong_no">Thu Công Nợ B2B</option>
                <option value="chi_nhap_phoi">Chi Mua Phôi Quà Tặng</option>
                <option value="chi_nhap_vat_tu_muc">Chi Mực In & Vật Tư</option>
                <option value="chi_dien_nuoc_3pha">Tiền Điện 3 Pha Xưởng</option>
                <option value="chi_thue_mat_bang">Thuê Mặt Bằng Xưởng</option>
                <option value="chi_luong_tho_in">Lương Thợ In</option>
                <option value="chi_bao_tri_may">Bảo Trì Máy In/Ép</option>
                <option value="chi_van_chuyen_ship">Cước Ship Ahamove/GHTK</option>
              </select>

              {/* Method Filter */}
              <select
                value={voucherPaymentMethodFilter}
                onChange={(e) => setVoucherPaymentMethodFilter(e.target.value as any)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 outline-none font-medium"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="chuyen_khoan">Chuyển Khoản (VietQR)</option>
                <option value="tien_mat">Tiền Mặt</option>
              </select>
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mã Phiếu</th>
                    <th className="py-3 px-4">Ngày Lập</th>
                    <th className="py-3 px-4">Loại & Danh Mục</th>
                    <th className="py-3 px-4">Diễn Giải / Nội Dung</th>
                    <th className="py-3 px-4 text-right">Số Tiền (VNĐ)</th>
                    <th className="py-3 px-4">Hình Thức</th>
                    <th className="py-3 px-4">Đối Tượng Nộp / Nhận</th>
                    <th className="py-3 px-4">Người Lập</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVouchers.map((v) => {
                    const catInfo = getFinancialCategoryInfo(v.category);
                    const isThu = v.type === 'thu';

                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedVoucherForDetail(v)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {v.voucherCode}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDateTime(v.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${catInfo.badge}`}
                          >
                            {isThu ? '+' : '-'} {catInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[260px]">
                            {v.title}
                          </p>
                          {v.orderCode && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold mt-0.5 inline-block">
                              Đơn: {v.orderCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`font-bold text-xs ${
                              isThu ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isThu ? '+' : '-'} {formatCurrency(v.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              v.paymentMethod === 'chuyen_khoan'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            }`}
                          >
                            {v.paymentMethod === 'chuyen_khoan' ? 'Chuyển Khoản' : 'Tiền Mặt'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 line-clamp-1 max-w-[150px]">
                          {v.recipientOrPayer}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {v.performer}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVoucherForDetail(v);
                            }}
                            className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: ACCOUNTS RECEIVABLE & DEBT SETTLEMENT */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'receivables' && (
        <div className="space-y-4">
          {/* Debt Summary Banner */}
          <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Danh Sách Đơn Hàng Còn Nợ Tiền ({debtOrders.length} đơn)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bao gồm các đơn chỉ mới cọc 50% hoặc chưa thanh toán. Sử dụng tính năng 1-Click để thu tiền hoặc tạo mã VietQR.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Tổng nợ cần thu:</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(financialMetrics.accountsReceivable)}
              </span>
            </div>
          </div>

          {/* Debt Orders Cards / Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {debtOrders.map((ord) => {
              const paymentInfo = getPaymentStatusInfo(ord.paymentStatus);
              const isCopied = copiedDebtOrderId === ord.id;

              return (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 hover:border-blue-400 dark:hover:border-blue-700 transition-all"
                >
                  {/* Header: Code & Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                      {ord.orderCode}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${paymentInfo.bg}`}>
                      {paymentInfo.label}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">
                      {ord.customerCompany || ord.customerName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {ord.customerPhone}
                    </p>
                    {ord.shippingAddress && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {ord.shippingAddress}
                      </p>
                    )}
                  </div>

                  {/* Product Summary */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                        {ord.items[0]?.productName}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        SL: {ord.items[0]?.quantity} chiếc • Hạn giao: {formatDate(ord.deadline)}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(ord.totalAmount)}
                    </span>
                  </div>

                  {/* Debt Numbers */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Đã cọc trước:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(ord.depositAmount)}
                      </span>
                    </div>
                    <div className="p-2 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/40">
                      <span className="text-[10px] text-rose-500 dark:text-rose-400 block font-semibold">Còn thiếu:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(ord.remainingDebt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                    {/* Settle Full */}
                    <button
                      onClick={() => handleQuickSettleOrder(ord)}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                      title="Ghi nhận đã thu đủ 100% tiền đơn và tự động lập Phiếu Thu"
                    >
                      <Check className="w-3.5 h-3.5" /> Thu Tất Toán
                    </button>

                    {/* Open QR */}
                    <button
                      onClick={() => onOpenVietQrModal(ord, ord.remainingDebt)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 rounded-xl transition-colors border border-blue-200 dark:border-blue-800"
                      title="Mở mã QR VietQR thu tiền đơn hàng"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {/* Copy Reminder */}
                    <button
                      onClick={(e) => handleCopyDebtMessage(e, ord)}
                      className={`p-1.5 rounded-xl transition-colors border ${
                        isCopied
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Copy mẫu tin nhắn Zalo nhắc nợ lịch sự kèm STK xưởng"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: PRODUCT PROFITABILITY & UNIT ECONOMICS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'product_profit' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Biên Lợi Nhuận Gộp & Kinh Tế Vi Mô Từng Dòng Sản Phẩm Quà Tặng
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                So sánh giá bán, chi phí phôi gốc, vật tư in ấn, hao hụt để xác định các dòng sản phẩm "ngôi sao lợi nhuận".
              </p>
            </div>
          </div>

          {/* Table of Product Profitability */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Sản Phẩm Quà Tặng</th>
                    <th className="py-3 px-4">Nhóm Công Nghệ</th>
                    <th className="py-3 px-4 text-center">SL Đã Bán</th>
                    <th className="py-3 px-4 text-right">Doanh Thu</th>
                    <th className="py-3 px-4 text-right">Giá Vốn Phôi</th>
                    <th className="py-3 px-4 text-right">Vật Tư In</th>
                    <th className="py-3 px-4 text-right">Hao Hụt</th>
                    <th className="py-3 px-4 text-right font-bold text-emerald-600">Lợi Nhuận Gộp</th>
                    <th className="py-3 px-4 text-center">Biên Lợi Nhuận (%)</th>
                    <th className="py-3 px-4 text-center">Đánh Giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {productProfitabilityList
                    .sort((a, b) => b.grossProfit - a.grossProfit)
                    .map((item) => {
                      const isHighMargin = item.grossMarginPercent >= 55;
                      const isMediumMargin = item.grossMarginPercent >= 40 && item.grossMarginPercent < 55;

                      return (
                        <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[220px]">
                              {item.productName}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">{item.sku}</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.serviceGroup === 'chuyen_nhiet'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              }`}
                            >
                              {item.serviceGroup === 'chuyen_nhiet' ? 'In Chuyển Nhiệt' : 'In Ảnh & Decal'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                            {item.totalSoldQty} {item.totalSoldQty > 0 ? 'chiếc' : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {formatCurrency(item.totalRevenue)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formatCurrency(item.totalBaseCost)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formatCurrency(item.totalPrintMaterialCost)}
                          </td>
                          <td className="py-3 px-4 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap">
                            {item.totalScrapCost > 0 ? formatCurrency(item.totalScrapCost) : '0 ₫'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {formatCurrency(item.grossProfit)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {item.grossMarginPercent.toFixed(1)}%
                              </span>
                              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                                <div
                                  className={`h-full rounded-full ${
                                    isHighMargin ? 'bg-emerald-500' : isMediumMargin ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, item.grossMarginPercent))}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {isHighMargin ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                ⭐️ Siêu Lợi Nhuận
                              </span>
                            ) : isMediumMargin ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                👍 Lợi Nhuận Tốt
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                ⚠️ Cần Tối Ưu Chi Phí
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: SCRAP & DEFECT WASTE ANALYTICS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'scrap_analytics' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Phân Tích Chi Phí Hao Hụt & Thiệt Hại Hỏng Phôi In
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nhật ký các lần cháy nhiệt, lệch khuôn, vỡ ly sứ/nứt đá làm phát sinh chi phí bù phôi xưởng phải chịu.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Tổng thiệt hại:</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(financialMetrics.totalScrapLoss)}
              </span>
            </div>
          </div>

          {/* Defect Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4">Mã Đơn</th>
                    <th className="py-3 px-4">Phôi Sản Phẩm</th>
                    <th className="py-3 px-4 text-center">SL Hỏng</th>
                    <th className="py-3 px-4">Nguyên Nhân Kỹ Thuật</th>
                    <th className="py-3 px-4 text-right">Chi Phí Thiệt Hại</th>
                    <th className="py-3 px-4">Thợ Vận Hành</th>
                    <th className="py-3 px-4">Ghi Chú Khắc Phục</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {defectLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {log.orderCode || 'Bù phôi test'}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">
                          {log.productName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">{log.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-rose-600 dark:text-rose-400">
                        {log.quantityScrapped} chiếc
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          {log.customReasonNote || log.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {formatCurrency(log.estimatedCostLoss)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {log.technicianName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1 max-w-[180px]">
                        {log.notes || 'Đã chỉnh lại thông số máy'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: NEW VOUCHER (LẬP PHIẾU THU / CHI MỚI) */}
      {/* ---------------------------------------------------- */}
      {isNewVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl text-white ${newVoucherData.type === 'thu' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                  {newVoucherData.type === 'thu' ? <Receipt className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {newVoucherData.type === 'thu' ? 'Lập Phiếu Thu Tiền (+)' : 'Lập Phiếu Chi Vận Hành (-)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Ghi nhận chứng từ vào sổ quỹ tiền mặt / ngân hàng</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewVoucherModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateVoucher} className="p-5 space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewVoucherData({ ...newVoucherData, type: 'chi', category: 'chi_dien_nuoc_3pha' })}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    newVoucherData.type === 'chi'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-rose-600'
                  }`}
                >
                  ⚠️ Phiếu Chi (-)
                </button>
                <button
                  type="button"
                  onClick={() => setNewVoucherData({ ...newVoucherData, type: 'thu', category: 'thu_tat_toan' })}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    newVoucherData.type === 'thu'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                  }`}
                >
                  ✓ Phiếu Thu (+)
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Danh Mục {newVoucherData.type === 'thu' ? 'Thu' : 'Chi'} *
                </label>
                <select
                  value={newVoucherData.category}
                  onChange={(e) => setNewVoucherData({ ...newVoucherData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 font-medium"
                >
                  {newVoucherData.type === 'thu' ? (
                    <>
                      <option value="thu_tat_toan">Thu Tất Toán / Giao Hàng COD</option>
                      <option value="thu_tien_coc">Thu Tiền Cọc Đơn Hàng</option>
                      <option value="thu_cong_no">Thu Công Nợ B2B / Đại Lý</option>
                      <option value="thu_khac">Khoản Thu Khác</option>
                    </>
                  ) : (
                    <>
                      <option value="chi_dien_nuoc_3pha">Tiền Điện 3 Pha & Nước Xưởng In</option>
                      <option value="chi_thue_mat_bang">Thuê Mặt Bằng Xưởng In</option>
                      <option value="chi_nhap_phoi">Chi Mua Phôi Quà Tặng (Ly, Áo, Đá...)</option>
                      <option value="chi_nhap_vat_tu_muc">Chi Mực In Sublimation / Decal / Màng</option>
                      <option value="chi_luong_tho_in">Lương & Phụ Cấp Thợ In</option>
                      <option value="chi_bao_tri_may">Bảo Trì / Thay Linh Kiện Máy Ép</option>
                      <option value="chi_van_chuyen_ship">Cước Giao Hàng Ahamove/GHTK</option>
                      <option value="chi_khac">Chi Phí Vận Hành Khác</option>
                    </>
                  )}
                </select>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu Đề / Diễn Giải Nội Dung *
                </label>
                <input
                  type="text"
                  required
                  value={newVoucherData.title}
                  onChange={(e) => setNewVoucherData({ ...newVoucherData, title: e.target.value })}
                  placeholder={
                    newVoucherData.type === 'thu'
                      ? 'VD: Thu tất toán đơn hàng GIFT-2608-01'
                      : 'VD: Chi tiền điện 3 pha xưởng in T8/2026'
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Amount & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Tiền (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={newVoucherData.amount || ''}
                    onChange={(e) => setNewVoucherData({ ...newVoucherData, amount: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-bold text-emerald-600 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hình Thức Thanh Toán
                  </label>
                  <select
                    value={newVoucherData.paymentMethod}
                    onChange={(e) => setNewVoucherData({ ...newVoucherData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="chuyen_khoan">Chuyển Khoản Ngân Hàng (VietQR)</option>
                    <option value="tien_mat">Tiền Mặt</option>
                  </select>
                </div>
              </div>

              {/* Recipient / Payer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {newVoucherData.type === 'thu' ? 'Người Nộp Tiền' : 'Người Nhận Tiền'}
                  </label>
                  <input
                    type="text"
                    value={newVoucherData.recipientOrPayer}
                    onChange={(e) => setNewVoucherData({ ...newVoucherData, recipientOrPayer: e.target.value })}
                    placeholder={newVoucherData.type === 'thu' ? 'Tên khách hàng' : 'Tên NCC / Đối tác'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Người Lập Chứng Từ
                  </label>
                  <input
                    type="text"
                    value={newVoucherData.performer}
                    onChange={(e) => setNewVoucherData({ ...newVoucherData, performer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Chứng Từ / Số Hóa Đơn
                </label>
                <textarea
                  rows={2}
                  value={newVoucherData.notes}
                  onChange={(e) => setNewVoucherData({ ...newVoucherData, notes: e.target.value })}
                  placeholder="Ghi chú thêm về chứng từ đính kèm, hóa đơn đỏ VAT..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewVoucherModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Lưu Phiếu Vào Sổ Quỹ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: VOUCHER DETAIL & PRINT PREVIEW */}
      {/* ---------------------------------------------------- */}
      {selectedVoucherForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Chi Tiết Chứng Từ Sổ Quỹ [{selectedVoucherForDetail.voucherCode}]
                </h3>
              </div>
              <button
                onClick={() => setSelectedVoucherForDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Voucher Content */}
            <div className="p-6 space-y-4 text-xs font-sans border-b border-slate-100 dark:border-slate-800">
              <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-base uppercase text-slate-900 dark:text-white">
                  {selectedVoucherForDetail.type === 'thu' ? 'PHIẾU THU TIỀN' : 'PHIẾU CHI TIỀN'}
                </h4>
                <p className="font-mono text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Số: {selectedVoucherForDetail.voucherCode}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ngày lập: {formatDateTime(selectedVoucherForDetail.date)}
                </p>
              </div>

              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {selectedVoucherForDetail.type === 'thu' ? 'Họ tên người nộp tiền:' : 'Họ tên người nhận tiền:'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedVoucherForDetail.recipientOrPayer}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Nội dung / Diễn giải:</span>
                  <span className="font-medium text-right max-w-[260px]">
                    {selectedVoucherForDetail.title}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl">
                  <span className="font-bold text-sm">Số tiền {selectedVoucherForDetail.type === 'thu' ? 'thu' : 'chi'}:</span>
                  <span
                    className={`font-black text-base ${
                      selectedVoucherForDetail.type === 'thu' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(selectedVoucherForDetail.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Hình thức:</span>
                  <span>
                    {selectedVoucherForDetail.paymentMethod === 'chuyen_khoan' ? 'Chuyển Khoản Ngân Hàng' : 'Tiền Mặt'}
                  </span>
                </div>

                {selectedVoucherForDetail.notes && (
                  <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <span className="font-semibold block text-[11px] text-slate-500">Ghi chú:</span>
                    <p className="italic text-slate-600 dark:text-slate-400">{selectedVoucherForDetail.notes}</p>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-center text-[11px]">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedVoucherForDetail.type === 'thu' ? 'Người Nộp Tiền' : 'Người Nhận Tiền'}
                  </p>
                  <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký, họ tên)</p>
                  <p className="mt-8 font-medium text-slate-600 dark:text-slate-400">
                    {selectedVoucherForDetail.recipientOrPayer}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Người Lập Phiếu</p>
                  <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký, họ tên)</p>
                  <p className="mt-8 font-medium text-slate-600 dark:text-slate-400">
                    {selectedVoucherForDetail.performer}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <button
                onClick={() => setSelectedVoucherForDetail(null)}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 font-semibold"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> In Phiếu A5
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: FULL P&L FINANCIAL REPORT PRINT VIEW */}
      {/* ---------------------------------------------------- */}
      {isPrintReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Bản In Báo Cáo Tài Chính & Hiệu Quả Sản Xuất Xưởng (A4)
                </h3>
              </div>
              <button
                onClick={() => setIsPrintReportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A4 Report Body */}
            <div className="p-8 space-y-6 text-xs text-slate-800 dark:text-slate-200 font-sans">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    XƯỞNG QUÀ TẶNG & IN ẤN CHUYÊN NGHIỆP GIFTPRINT PRO
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Địa chỉ: 142 Tân Triều, Thanh Trì, Hà Nội • Hotline: 0988.776.655</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs">BÁO CÁO TÀI CHÍNH THÁNG 8/2026</p>
                  <p className="text-[10px] text-slate-400">Xuất ngày: {formatDate(new Date().toISOString())}</p>
                </div>
              </div>

              {/* Key Highlights Table */}
              <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-700">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="p-2.5 border border-slate-200 dark:border-slate-700 font-bold">Chỉ Tiêu Tài Chính</th>
                    <th className="p-2.5 border border-slate-200 dark:border-slate-700 font-bold text-right">Giá Trị (VNĐ)</th>
                    <th className="p-2.5 border border-slate-200 dark:border-slate-700 font-bold text-center">Tỷ Trọng (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold">1. Tổng Doanh Thu Đơn Hàng</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-right font-bold text-blue-600">
                      {formatCurrency(financialMetrics.totalOrderRevenue)}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-center">100.0%</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 pl-6">(-) Giá vốn phôi quà tặng</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-right">
                      {formatCurrency(financialMetrics.estimatedTotalBlankCost)}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                      {(
                        (financialMetrics.estimatedTotalBlankCost / (financialMetrics.totalOrderRevenue || 1)) *
                        100
                      ).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 pl-6">(-) Mực in & vật tư tiêu hao</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-right">
                      {formatCurrency(financialMetrics.estimatedTotalMaterialCost)}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                      {(
                        (financialMetrics.estimatedTotalMaterialCost / (financialMetrics.totalOrderRevenue || 1)) *
                        100
                      ).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 pl-6 text-rose-600">(-) Chi phí hao hụt hỏng phôi</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-right text-rose-600 font-semibold">
                      {formatCurrency(financialMetrics.totalScrapLoss)}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-center text-rose-600">
                      {(
                        (financialMetrics.totalScrapLoss / (financialMetrics.totalOrderRevenue || 1)) *
                        100
                      ).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold">
                    <td className="p-2 border border-slate-200 dark:border-slate-700">2. Lợi Nhuận Gộp (Gross Profit)</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-right text-emerald-600">
                      {formatCurrency(financialMetrics.grossProfit)}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-center text-emerald-600">
                      {financialMetrics.grossMarginPercent.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 pl-6">(-) Chi phí vận hành xưởng (OPEX)</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-right">
                      {formatCurrency(financialMetrics.opex)}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                      {((financialMetrics.opex / (financialMetrics.totalOrderRevenue || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-emerald-600 text-white font-bold">
                    <td className="p-2.5 border border-emerald-700">3. Lợi Nhuận Ròng Thực Tế (Net Profit)</td>
                    <td className="p-2.5 border border-emerald-700 text-right text-sm">
                      {formatCurrency(financialMetrics.netProfit)}
                    </td>
                    <td className="p-2.5 border border-emerald-700 text-center">
                      {financialMetrics.netMarginPercent.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs">
                <div>
                  <p className="font-bold">Kế Toán Xưởng</p>
                  <p className="text-[10px] text-slate-400 italic">(Ký, họ tên)</p>
                  <p className="mt-12 font-medium">Vũ Thu Thảo</p>
                </div>
                <div>
                  <p className="font-bold">Quản Lý Sản Xuất</p>
                  <p className="text-[10px] text-slate-400 italic">(Ký, họ tên)</p>
                  <p className="mt-12 font-medium">Nguyễn Văn Tuấn</p>
                </div>
                <div>
                  <p className="font-bold">Giám Đốc Xưởng In</p>
                  <p className="text-[10px] text-slate-400 italic">(Ký, họ tên & đóng dấu)</p>
                  <p className="mt-12 font-medium">Phan Minh Hoàng</p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <button
                onClick={() => setIsPrintReportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 font-semibold"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> In Báo Cáo A4
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
