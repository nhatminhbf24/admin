import React from 'react';
import {
  X,
  Printer,
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusInfo, getPriorityInfo, getPaymentStatusInfo } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO } from '../data/mockData';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePayment: (orderId: string, payment: PaymentStatus) => void;
  onOpenJobTicket: (order: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdatePayment,
  onOpenJobTicket,
}) => {
  if (!order) return null;

  const statusInfo = getOrderStatusInfo(order.status);
  const priorityInfo = getPriorityInfo(order.priority);
  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);

  const STAGES: OrderStatus[] = ['tiep_nhan', 'duyet_mockup', 'che_ban', 'dang_in', 'gia_cong', 'hoan_tat'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Đơn Hàng In: {order.orderCode}
                </h3>
                {order.priority !== 'binh_thuong' && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityInfo.badge}`}>
                    {priorityInfo.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tạo lúc {formatDateTime(order.createdAt)} • Hạn giao {formatDate(order.deadline)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs">
          {/* Stage Progress Pills */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Công Đoạn Sản Xuất Xưởng Hiện Tại:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {STAGES.map((st, idx) => {
                const sInfo = getOrderStatusInfo(st);
                const isCurrent = order.status === st;
                const isPast = statusInfo.stepIndex > idx;
                return (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(order.id, st)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : isPast
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {sInfo.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer & Delivery */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Khách Hàng & Giao Hàng:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <p><strong>Người liên hệ:</strong> {order.customerName}</p>
              <p><strong>Công ty/Tổ chức:</strong> {order.customerCompany || 'Khách lẻ'}</p>
              <p><strong>Điện thoại:</strong> {order.customerPhone}</p>
              <p><strong>Email:</strong> {order.customerEmail || 'Chưa cập nhật'}</p>
              <p className="sm:col-span-2"><strong>Địa chỉ nhận hàng:</strong> {order.shippingAddress}</p>
            </div>
          </div>

          {/* Items & Mockups */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Sản Phẩm & Bản In Mockup:
            </h4>
            {order.items.map((it) => (
              <div
                key={it.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
              >
                <div className="flex gap-4 items-start">
                  <img
                    src={it.mockupUrl}
                    alt={it.productName}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      {it.productName}
                    </h5>
                    <p className="text-slate-500 font-mono">SKU: {it.sku}</p>
                    <div className="flex items-center gap-4 mt-1 font-semibold text-blue-600 dark:text-blue-400">
                      <span>Số lượng: {it.quantity} chiếc</span>
                      <span>Đơn giá: {formatCurrency(it.unitPrice + it.printPricePerUnit)}</span>
                    </div>
                  </div>
                </div>

                {/* Print positions */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Vị trí & Thông số in ấn:</p>
                  {it.printPositions.map((pos) => (
                    <div key={pos.id} className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>• {pos.name} ({pos.technique.toUpperCase()}): {pos.colors}</span>
                      <span className="font-mono">{pos.dimensions}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Payment & Action */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Tổng Giá Trị Đơn Hàng:</p>
              <p className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                {formatCurrency(order.totalAmount)}
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                Đã đặt cọc: {formatCurrency(order.depositAmount)} • Còn lại: {formatCurrency(order.totalAmount - order.depositAmount)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenJobTicket(order);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-4 h-4" /> Xuất Phiếu Lệnh Xưởng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
