import React, { useState, useMemo } from 'react';
import {
  Archive,
  Search,
  Download,
  Calendar,
  Phone,
  FileText,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, PriorityLevel } from '../types';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getOrderStatusInfo,
  getPriorityInfo,
  getPaymentStatusInfo,
  generateDeliveryLabelCopy,
} from '../utils/formatters';

interface OrderHistoryViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUnarchiveOrder: (orderId: string) => void;
  onPrintJobTicket: (order: Order) => void;
  onPrintDeliveryReceipt?: (order: Order) => void;
  onReorder?: (order: Order) => void;
}

type TimeFilter = 'all' | 'this_month' | 'last_month' | 'this_year';

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  onSelectOrder,
  onUnarchiveOrder,
  onPrintJobTicket,
  onPrintDeliveryReceipt,
  onReorder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Filter archived orders (and include completed orders)
  const archivedOrders = useMemo(() => {
    return orders.filter((o) => {
      // Include explicitly archived orders OR completed orders
      const isHistorical = o.isArchived || o.status === 'hoan_tat';
      if (!isHistorical) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchCode = o.orderCode.toLowerCase().includes(q);
        const matchCust = o.customerName.toLowerCase().includes(q) || (o.customerCompany && o.customerCompany.toLowerCase().includes(q));
        const matchPhone = o.customerPhone.includes(q);
        const matchProduct = o.items.some((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
        if (!matchCode && !matchCust && !matchPhone && !matchProduct) return false;
      }

      // Payment Filter
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;

      // Priority Filter
      if (priorityFilter !== 'all' && o.priority !== priorityFilter) return false;

      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, paymentFilter, priorityFilter, timeFilter]);

  // Financial summary of historical orders
  const summary = useMemo(() => {
    const count = archivedOrders.length;
    const totalRev = archivedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalItems = archivedOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    const fullyPaidCount = archivedOrders.filter((o) => o.paymentStatus === 'da_tat_toan').length;

    return { count, totalRev, totalItems, fullyPaidCount };
  }, [archivedOrders]);

  // Copy shipping info
  const handleCopyShipping = (e: React.MouseEvent, ord: Order) => {
    e.stopPropagation();
    const text = generateDeliveryLabelCopy(ord);
    navigator.clipboard.writeText(text);
    setCopiedOrderId(ord.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'MÃ ĐƠN,NGÀY TẠO,KHÁCH HÀNG,SỐ ĐIỆN THOẠI,SẢN PHẨM,SỐ LƯỢNG,TỔNG TIỀN (VNĐ),THANH TOÁN,TRẠNG THÁI,HẠN GIAO\n';

    archivedOrders.forEach((ord) => {
      const itemsStr = ord.items.map((i) => `${i.productName} (${i.quantity})`).join('; ');
      const totalQty = ord.items.reduce((s, i) => s + i.quantity, 0);
      const row = [
        `"${ord.orderCode}"`,
        `"${formatDate(ord.createdAt)}"`,
        `"${(ord.customerCompany || ord.customerName).replace(/"/g, '""')}"`,
        `"${ord.customerPhone}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        totalQty,
        ord.totalAmount,
        `"${ord.paymentStatus === 'da_tat_toan' ? 'Đã thanh toán 100%' : 'Chưa tất toán'}"`,
        `"${ord.isArchived ? 'Đã lưu trữ' : 'Đã hoàn tất'}"`,
        `"${formatDate(ord.deadline)}"`,
      ];
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lich_Su_Don_Hang_GiftPrint_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-800/20">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Lịch Sử & Lưu Trữ Đơn Hàng (Order History & Archive)
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {archivedOrders.length} đơn
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kho lưu trữ trọn đời các đơn hàng đã giao và nghiệm thu. Giữ bảng Kanban WIP luôn gọn gàng, tra cứu lại file in và tái bản đơn hàng nhanh chóng.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Xuất Excel Lịch Sử
          </button>
        </div>
      </div>

      {/* KPI Stats of Historical Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng Đơn Đã Lưu Trữ</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">{summary.count} đơn</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Đã hoàn thành và giao hàng thành công</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng Sản Lượng Đã Giao</span>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1.5">{summary.totalItems.toLocaleString()} món quà</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Ly sứ, áo thun, móc khóa, quà tặng...</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng Doanh Số Đã Thực Hiện</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{formatCurrency(summary.totalRev)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{summary.fullyPaidCount}/{summary.count} đơn đã thu 100% tiền</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tái Đặt Hàng (Re-order)</span>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1.5">Sẵn Sàng 100%</p>
          <p className="text-[11px] text-purple-500 dark:text-purple-400 mt-0.5">Tải lại file in và nhân bản đơn nhanh</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn (GIFT-...), tên khách hàng, số điện thoại, tên sản phẩm..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 outline-none font-medium"
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="da_tat_toan">Đã tất toán 100%</option>
            <option value="da_coc_50">Đã cọc 50%</option>
            <option value="chua_thanh_toan">Chưa thanh toán</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 outline-none font-medium"
          >
            <option value="all">Tất cả độ ưu tiên</option>
            <option value="hoa_toc">Hỏa tốc</option>
            <option value="gap">Gấp</option>
            <option value="binh_thuong">Bình thường</option>
          </select>
        </div>
      </div>

      {/* Historical Orders Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 w-16 text-center">Ảnh In</th>
                <th className="py-3 px-4">Mã Đơn & Ngày Lập</th>
                <th className="py-3 px-4">Khách Hàng & Liên Hệ</th>
                <th className="py-3 px-4">Sản Phẩm & Phôi Quà</th>
                <th className="py-3 px-4">Công Nghệ & Kỹ Thuật</th>
                <th className="py-3 px-4">Giá Trị / Thanh Toán</th>
                <th className="py-3 px-4">Trạng Thái Lưu Trữ</th>
                <th className="py-3 px-4 text-right">Thao Tác / Tái Bản</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {archivedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Archive className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-sm">Chưa có đơn hàng nào trong kho lưu trữ</p>
                    <p className="text-xs mt-1">Khi các đơn ở cột "Đã Giao / Nghiệm Thu" trên Kanban được bấm nút Lưu trữ, chúng sẽ xuất hiện tại đây.</p>
                  </td>
                </tr>
              ) : (
                archivedOrders.map((ord) => {
                  const mainItem = ord.items[0];
                  const paymentInfo = getPaymentStatusInfo(ord.paymentStatus);
                  const isCopied = copiedOrderId === ord.id;

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => onSelectOrder(ord)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="relative inline-block group/thumb">
                          {mainItem?.mockupUrl ? (
                            <img
                              src={mainItem.mockupUrl}
                              alt={mainItem.productName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs group-hover/thumb:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          {ord.items.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-slate-700 text-white text-[9px] font-bold px-1 rounded-full border border-white dark:border-slate-900">
                              +{ord.items.length - 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Order Code & Creation Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                          {ord.orderCode}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {formatDate(ord.createdAt)}
                        </span>
                      </td>

                      {/* Customer & Quick Copy */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {ord.customerCompany || ord.customerName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> {ord.customerPhone}
                            </p>
                          </div>

                          <button
                            onClick={(e) => handleCopyShipping(e, ord)}
                            className={`p-1 rounded-md transition-all ${
                              isCopied
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            title="Copy thông tin gửi hàng"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Product Name & Qty */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[200px]">
                          {mainItem?.productName}
                        </p>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">
                          Số lượng: {mainItem?.quantity} chiếc
                        </span>
                      </td>

                      {/* Print Techniques */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 max-w-[160px]">
                          {mainItem?.printPositions.map((p) => (
                            <span key={p.id} className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                              • {p.name}: <strong className="uppercase">{p.technique}</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(ord.totalAmount)}
                        </p>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${paymentInfo.bg}`}>
                          {paymentInfo.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{ord.isArchived ? 'Đã Lưu Trữ' : 'Đã Hoàn Tất'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Re-order button if callback provided */}
                          {onReorder && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReorder(ord);
                              }}
                              className="px-2 py-1 text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 rounded-lg transition-colors flex items-center gap-1 border border-purple-200 dark:border-purple-800"
                              title="Tái đặt đơn hàng này với cùng thông số"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Tái Bản
                            </button>
                          )}

                          {/* Unarchive button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnarchiveOrder(ord.id);
                            }}
                            className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                            title="Khôi phục lại vào bảng Kanban đang chạy (WIP) nếu cần in bù/bảo hành"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-blue-500" /> Khôi Phục
                          </button>

                          {/* Print Job Ticket */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPrintJobTicket(ord);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Xem lại lệnh sản xuất"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
