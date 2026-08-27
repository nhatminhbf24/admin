import React, { useState } from 'react';
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
  ChevronRight,
  QrCode,
  Package,
  ArrowDownToLine,
  Flame,
  Camera,
  Users,
  Truck
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, DefectLog } from '../types';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusInfo, getPriorityInfo, getPaymentStatusInfo } from '../utils/formatters';
import { calculateOrderBOM } from '../utils/bomCalculator';
import { VietQrModal } from './VietQrModal';

interface OrderDetailsModalProps {
  order: Order | null;
  defectLogs?: DefectLog[];
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePayment: (orderId: string, payment: PaymentStatus) => void;
  onOpenJobTicket: (order: Order) => void;
  onOpenDeliveryReceipt?: (order: Order) => void;
  onDeductBOM?: (order: Order) => void;
  onOpenDefectModal?: (orderId: string, productSku?: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  defectLogs = [],
  onClose,
  onUpdateStatus,
  onUpdatePayment,
  onOpenJobTicket,
  onOpenDeliveryReceipt,
  onDeductBOM,
  onOpenDefectModal,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [bomDeducted, setBomDeducted] = useState(false);

  if (!order) return null;

  const statusInfo = getOrderStatusInfo(order.status);
  const priorityInfo = getPriorityInfo(order.priority);
  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);

  const STAGES: OrderStatus[] = ['tiep_nhan', 'duyet_mockup', 'che_ban', 'dang_in', 'gia_cong', 'hoan_tat'];
  const bomReport = calculateOrderBOM(order);

  // Filter defects for this order
  const orderDefects = defectLogs.filter(d => d.orderId === order.id || d.orderCode === order.orderCode);

  const handleDeductBOMClick = () => {
    if (onDeductBOM) {
      onDeductBOM(order);
      setBomDeducted(true);
    }
  };

  return (
    <>
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
                    Đơn Hàng: {order.orderCode}
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

            <div className="flex items-center gap-2">
              {onOpenDeliveryReceipt && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDeliveryReceipt(order);
                  }}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all border border-rose-200 dark:border-rose-800"
                  title="In phiếu giao hàng khổ A6 / A7 / K80"
                >
                  <Truck className="w-4 h-4 text-rose-600" /> Phiếu Giao A6/A7
                </button>
              )}

              {onOpenDefectModal && (
                <button
                  onClick={() => onOpenDefectModal(order.id, order.items[0]?.sku)}
                  className="px-2.5 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all border border-amber-200 dark:border-amber-800"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Báo In Lại
                </button>
              )}

              <button
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all border border-indigo-200 dark:border-indigo-800"
              >
                <QrCode className="w-4 h-4 text-indigo-600" /> VietQR
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs">
            
            {/* Defect Spoilage Alert Banner if any defect was reported for this order */}
            {orderDefects.length > 0 && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Nhật Ký Báo Hỏng & Xuất Phôi Bù ({orderDefects.length} lần)
                  </span>
                  <span className="text-[11px] bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 rounded font-mono">
                    Không tăng tiền thu khách
                  </span>
                </div>
                <div className="space-y-1 pt-1 text-[11px] text-slate-700 dark:text-slate-300">
                  {orderDefects.map((def) => (
                    <div key={def.id} className="flex items-center justify-between bg-white dark:bg-slate-900/80 p-2 rounded-xl border border-rose-100 dark:border-rose-900/40">
                      <div>
                        <span className="font-bold text-rose-600 dark:text-rose-400">-{def.quantityScrapped} {def.productName}</span>
                        <p className="text-[10px] text-slate-400">Lý do: {def.customReasonNote || def.reason} • Thợ: {def.technicianName}</p>
                      </div>
                      <span className="font-bold text-rose-600 text-xs">Xưởng bù: {formatCurrency(def.estimatedCostLoss)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                <p><strong>Địa chỉ nhận hàng:</strong> {order.shippingAddress}</p>
              </div>
            </div>

            {/* Items & Mockups */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Sản Phẩm & Bản In Mockup:
                </h4>
                {onOpenDefectModal && (
                  <button
                    onClick={() => onOpenDefectModal(order.id, order.items[0]?.sku)}
                    className="text-rose-600 dark:text-rose-400 hover:underline font-bold text-xs flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Báo in lại / Hỏng phôi
                  </button>
                )}
              </div>

              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 mb-3"
                >
                  <div className="flex gap-4 items-start">
                    <img
                      src={it.mockupUrl}
                      alt={it.productName}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                            {it.productName}
                          </h5>
                          <p className="text-slate-500 font-mono text-[11px]">SKU: {it.sku}</p>
                        </div>
                        {onOpenDefectModal && (
                          <button
                            onClick={() => onOpenDefectModal(order.id, it.sku)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-900"
                            title="Báo in lại hoặc lỗi phôi cho món này"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-500" /> Báo Lỗi Món Này
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 font-semibold text-blue-600 dark:text-blue-400">
                        <span>Số lượng: {it.quantity} {it.category === 'in_nhan_vo' ? 'set' : 'chiếc'}</span>
                        <span>Đơn giá: {formatCurrency(it.unitPrice + it.printPricePerUnit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Print positions & Machine Specs */}
                  {it.heatPressSpecs ? (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-600" /> Cài đặt ép nhiệt:
                      </span>
                      <span>
                        {it.heatPressSpecs.temperatureC}°C • {it.heatPressSpecs.timeSeconds}s • {it.heatPressSpecs.recommendedMachine}
                      </span>
                    </div>
                  ) : it.photoPrintSpecs ? (
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-blue-600" /> Cán màng / Giấy:
                      </span>
                      <span>{it.photoPrintSpecs.paperType} • {it.photoPrintSpecs.lamination}</span>
                    </div>
                  ) : null}

                  {/* Custom Names list if available */}
                  {it.customNames && it.customNames.length > 0 && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> Danh Sách {it.customNames.length} Tên Riêng Cần In:
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        {it.customNames.map((nm, nIdx) => (
                          <span
                            key={nIdx}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium"
                          >
                            {nm}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* BOM Material Consumption Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-600" /> Định Mức Vật Tư Tiêu Hao (BOM):
                </h4>
                {onDeductBOM && (
                  <button
                    onClick={handleDeductBOMClick}
                    disabled={bomDeducted}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                      bomDeducted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                    }`}
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    {bomDeducted ? '✓ Đã Trừ Kho' : 'Trừ Kho Vật Tư Ngay'}
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-700 text-[11px]">
                {bomReport.totalConsumptions.map((mat, mIdx) => (
                  <div key={mIdx} className="py-1.5 flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-medium">• {mat.materialName}</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400">
                      {mat.totalQuantity} {mat.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Action */}
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Tổng Giá Trị Đơn Hàng:</p>
                <p className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                  {formatCurrency(order.totalAmount)}
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                  Trạng thái: <strong>{paymentInfo.label}</strong> (Đã cọc {formatCurrency(order.depositAmount)})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onOpenDeliveryReceipt && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDeliveryReceipt(order);
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Truck className="w-4 h-4" /> Xuất Phiếu Giao A6/A7
                  </button>
                )}

                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <QrCode className="w-4 h-4" /> Quét VietQR
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenJobTicket(order);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-4 h-4" /> Lệnh Xưởng
                </button>
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
