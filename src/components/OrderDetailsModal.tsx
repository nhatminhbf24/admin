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
  Truck,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Upload,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Send,
  Navigation,
  Archive,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, DefectLog, ProofDesignInfo, ProofStatus, ShippingCarrier, ShippingTrackingInfo, ShippingStatus } from '../types';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusInfo, getPriorityInfo, getPaymentStatusInfo, getProofStatusInfo, getCarrierInfo, getShippingStatusInfo } from '../utils/formatters';
import { calculateOrderBOM } from '../utils/bomCalculator';
import { VietQrModal } from './VietQrModal';

interface OrderDetailsModalProps {
  order: Order | null;
  defectLogs?: DefectLog[];
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePayment: (orderId: string, payment: PaymentStatus) => void;
  onUpdateProofDesign?: (orderId: string, proof: Partial<ProofDesignInfo>) => void;
  onUpdateShippingInfo?: (orderId: string, shipping: Partial<ShippingTrackingInfo>) => void;
  onOpenJobTicket: (order: Order) => void;
  onOpenDeliveryReceipt?: (order: Order) => void;
  onDeductBOM?: (order: Order) => void;
  onOpenDefectModal?: (orderId: string, productSku?: string) => void;
  onArchiveOrder?: (orderId: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  defectLogs = [],
  onClose,
  onUpdateStatus,
  onUpdatePayment,
  onUpdateProofDesign,
  onUpdateShippingInfo,
  onOpenJobTicket,
  onOpenDeliveryReceipt,
  onDeductBOM,
  onOpenDefectModal,
  onArchiveOrder,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [bomDeducted, setBomDeducted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [editingProofNote, setEditingProofNote] = useState(false);
  const [proofFeedbackInput, setProofFeedbackInput] = useState('');
  const [showProofFullImage, setShowProofFullImage] = useState(false);

  // Shipping edit states
  const [editingShipping, setEditingShipping] = useState(false);
  const [shippingCarrier, setShippingCarrier] = useState<ShippingCarrier>(order?.shippingInfo?.carrier || 'ahamove');
  const [trackingCode, setTrackingCode] = useState(order?.shippingInfo?.trackingCode || '');
  const [shippingNotes, setShippingNotes] = useState(order?.shippingInfo?.notes || '');
  const [codAmount, setCodAmount] = useState<number>(
    order?.shippingInfo?.codAmount !== undefined 
      ? order.shippingInfo.codAmount 
      : Math.max(0, (order?.totalAmount || 0) - (order?.depositAmount || 0))
  );
  const [isCodCollected, setIsCodCollected] = useState<boolean>(order?.shippingInfo?.isCodCollected || false);

  if (!order) return null;

  const statusInfo = getOrderStatusInfo(order.status);
  const priorityInfo = getPriorityInfo(order.priority);
  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
  const proofInfo = getProofStatusInfo(order.proofDesign?.status);
  const carrierInfo = getCarrierInfo(order.shippingInfo?.carrier || 'ahamove');
  const shippingStatusInfo = getShippingStatusInfo(order.shippingInfo?.status || 'cho_dong_goi');

  const STAGES: OrderStatus[] = ['dang_thiet_ke', 'da_in_cho_ep', 'da_ep_cho_giao', 'dang_giao'];
  const bomReport = calculateOrderBOM(order);

  // Filter defects for this order
  const orderDefects = defectLogs.filter(d => d.orderId === order.id || d.orderCode === order.orderCode);

  const handleDeductBOMClick = () => {
    if (onDeductBOM) {
      onDeductBOM(order);
      setBomDeducted(true);
    }
  };

  const shareableProofUrl = `https://mockup.giftprint.vn/p/${order.proofDesign?.shareCode || order.orderCode.toLowerCase()}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableProofUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleProofStatusChange = (newStatus: ProofStatus) => {
    if (onUpdateProofDesign) {
      onUpdateProofDesign(order.id, {
        status: newStatus,
        customerFeedback: proofFeedbackInput || order.proofDesign?.customerFeedback,
      });
    }
  };

  const handleSaveShipping = () => {
    if (onUpdateShippingInfo) {
      onUpdateShippingInfo(order.id, {
        carrier: shippingCarrier,
        trackingCode: trackingCode.trim(),
        codAmount: Number(codAmount),
        isCodCollected,
        notes: shippingNotes.trim(),
      });
      setEditingShipping(false);
    }
  };

  const handleShippingStatusChange = (newStatus: ShippingStatus) => {
    if (onUpdateShippingInfo) {
      onUpdateShippingInfo(order.id, {
        status: newStatus,
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Đơn Hàng: {order.orderCode}
                  </h3>
                  {order.priority !== 'binh_thuong' && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${priorityInfo.badge}`}>
                      {priorityInfo.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tạo {formatDateTime(order.createdAt)} • Hạn giao <strong className="text-slate-700 dark:text-slate-200">{formatDate(order.deadline)}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenJobTicket(order);
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all border border-blue-200 dark:border-blue-800"
                title="In Lệnh Sản Xuất Xưởng A4/A5"
              >
                <Printer className="w-4 h-4 text-blue-600" /> In Lệnh Xưởng
              </button>

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

              <button
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all border border-indigo-200 dark:border-indigo-800"
              >
                <QrCode className="w-4 h-4 text-indigo-600" /> VietQR
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto custom-scrollbar text-xs">
            
            {/* Defect Alert Banner */}
            {orderDefects.length > 0 && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-1.5">
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

            {/* SECTION 1: PROOFING WORKFLOW (QUY TRÌNH DUYỆT FILE IN MẪU & MOCKUP) */}
            <div className="p-4.5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/60 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      Quy Trình Duyệt File In Mẫu (Proof Design)
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${proofInfo.badge}`}>
                        {proofInfo.label}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mockup demo 2D, file vector in ấn và link duyệt trực tuyến cho khách hàng
                    </p>
                  </div>
                </div>

                {/* Link Chia Sẻ Nhanh Cho Khách Duyệt */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyShareLink}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Đã Copy Link Zalo!' : 'Copy Link Gửi Khách (Zalo)'}
                  </button>
                </div>
              </div>

              {/* Mockup Preview & File Spec Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Mockup image */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900 flex flex-col items-center justify-center text-center group relative overflow-hidden">
                  <img
                    src={order.proofDesign?.mockupImageUrl || order.items[0]?.mockupUrl || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500'}
                    alt="Mockup"
                    className="w-full h-36 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setShowProofFullImage(true)}
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Click xem ảnh mockup phóng to
                  </span>
                </div>

                {/* Design File details & Status buttons */}
                <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">File thiết kế gốc:</span>
                      {order.proofDesign?.designFileUrl ? (
                        <a
                          href={order.proofDesign.designFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> {order.proofDesign.designFileUrl.split('/').pop()} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Chưa đính kèm file vector/pdf</span>
                      )}
                    </div>

                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                        <span>Phản hồi duyệt mẫu từ khách:</span>
                        <span className="text-[10px] text-slate-400">Phiên bản V{order.proofDesign?.version || 1}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 italic">
                        "{order.proofDesign?.customerFeedback || 'Chưa có ghi chú phản hồi nào từ khách.'}"
                      </p>
                    </div>
                  </div>

                  {/* Proof Action Buttons */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Cập Nhật Trạng Thái Duyệt Bản Mẫu:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        onClick={() => handleProofStatusChange('cho_gui_mockup')}
                        className={`py-1.5 px-2 rounded-xl font-bold text-[11px] border transition-all text-center ${
                          order.proofDesign?.status === 'cho_gui_mockup'
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        1. Chờ gửi mockup
                      </button>
                      <button
                        onClick={() => handleProofStatusChange('cho_khach_duyet')}
                        className={`py-1.5 px-2 rounded-xl font-bold text-[11px] border transition-all text-center ${
                          order.proofDesign?.status === 'cho_khach_duyet'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50'
                        }`}
                      >
                        2. Đã gửi - Chờ duyệt
                      </button>
                      <button
                        onClick={() => handleProofStatusChange('khach_da_duyet')}
                        className={`py-1.5 px-2 rounded-xl font-bold text-[11px] border transition-all text-center ${
                          order.proofDesign?.status === 'khach_da_duyet'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        3. ✓ OK Duyệt (In ngay)
                      </button>
                      <button
                        onClick={() => handleProofStatusChange('yeu_cau_sua')}
                        className={`py-1.5 px-2 rounded-xl font-bold text-[11px] border transition-all text-center ${
                          order.proofDesign?.status === 'yeu_cau_sua'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-50'
                        }`}
                      >
                        4. ⚠️ Yêu cầu sửa mẫu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: PRODUCTION STAGE PROGRESS */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Công Đoạn Sản Xuất Xưởng Hiện Tại:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

            {/* SECTION 3: SHIPPING TRACKING & CARRIER (VẬN CHUYỂN & GIAO HÀNG) */}
            <div className="p-4.5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      Theo Dõi Giao Hàng & Đơn Vị Vận Chuyển
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${shippingStatusInfo.badge}`}>
                        {shippingStatusInfo.label}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Đơn vị giao, mã vận đơn tra cứu và tiền thu hộ COD
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingShipping(!editingShipping)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs shadow-2xs"
                  >
                    {editingShipping ? 'Hủy sửa' : '✏️ Cập nhật vận đơn'}
                  </button>
                </div>
              </div>

              {editingShipping ? (
                /* Edit Form */
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Đơn Vị Vận Chuyển:
                      </label>
                      <select
                        value={shippingCarrier}
                        onChange={(e) => setShippingCarrier(e.target.value as ShippingCarrier)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      >
                        <option value="ahamove">Ahamove (Xe máy/Xe tải giao nhanh)</option>
                        <option value="grab_express">GrabExpress</option>
                        <option value="viettel_post">ViettelPost</option>
                        <option value="ghtk">Giao Hàng Tiết Kiệm (GHTK)</option>
                        <option value="vnpost">VNPost (Bưu điện VN)</option>
                        <option value="shipper_xuong">Shipper Xưởng Giao Trực Tiếp</option>
                        <option value="nhan_tai_xuong">Khách Nhận Tại Xưởng</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mã Vận Đơn / Tracking:
                      </label>
                      <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        placeholder="VD: AHA-99281, VTP-2234..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tiền Thu Hộ (COD):
                      </label>
                      <input
                        type="number"
                        value={codAmount}
                        onChange={(e) => setCodAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-bold">
                      <input
                        type="checkbox"
                        checked={isCodCollected}
                        onChange={(e) => setIsCodCollected(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Đã Thu Tiền COD Thành Công</span>
                    </label>

                    <button
                      onClick={handleSaveShipping}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
                    >
                      Lưu Thông Tin Vận Chuyển
                    </button>
                  </div>
                </div>
              ) : (
                /* View Shipping Summary */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-400 text-[10px]">Đơn vị giao:</p>
                    <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 flex items-center gap-1">
                      📦 {carrierInfo.label}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-400 text-[10px]">Mã vận đơn:</p>
                    <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                      {order.shippingInfo?.trackingCode || 'Chưa có mã'}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-400 text-[10px]">Tiền thu hộ COD:</p>
                    <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                      {formatCurrency(order.shippingInfo?.codAmount || Math.max(0, order.totalAmount - order.depositAmount))}
                      {order.shippingInfo?.isCodCollected ? (
                        <span className="text-[10px] text-emerald-600 block">✓ Đã thu đủ</span>
                      ) : (
                        <span className="text-[10px] text-amber-600 block">⏳ Chưa thu</span>
                      )}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <p className="text-slate-400 text-[10px]">Chuyển trạng thái giao:</p>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => handleShippingStatusChange('dang_giao')}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border text-center ${
                          order.shippingInfo?.status === 'dang_giao'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Đang giao
                      </button>
                      <button
                        onClick={() => handleShippingStatusChange('giao_thanh_cong')}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border text-center ${
                          order.shippingInfo?.status === 'giao_thanh_cong'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        ✓ Đã giao
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: CUSTOMER & DELIVERY ADDRESS */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Khách Hàng & Địa Chỉ Nhận:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                <p><strong>Người liên hệ:</strong> {order.customerName}</p>
                <p><strong>Công ty/Tổ chức:</strong> {order.customerCompany || 'Khách lẻ'}</p>
                <p><strong>Điện thoại:</strong> {order.customerPhone}</p>
                <p><strong>Địa chỉ nhận hàng:</strong> {order.shippingAddress}</p>
              </div>
            </div>

            {/* SECTION 5: ITEMS LIST */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Chi Tiết Món Hàng & Thông Số Kỹ Thuật:
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

            {/* SECTION 6: BOM MATERIAL CONSUMPTION */}
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

            {/* SECTION 7: PAYMENT & FOOTER */}
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
                {order.status === 'hoan_tat' && !order.isArchived && onArchiveOrder && (
                  <button
                    onClick={() => {
                      onArchiveOrder(order.id);
                      onClose();
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                    title="Chuyển đơn này vào kho Lịch Sử & Lưu Trữ Đơn"
                  >
                    <Archive className="w-4 h-4" /> Lưu Trữ Đơn
                  </button>
                )}

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
                  <FileText className="w-4 h-4" /> In Lệnh Xưởng A4/A5
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

      {/* Full Mockup Image Zoom Modal */}
      {showProofFullImage && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowProofFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-4 overflow-hidden border border-slate-700 shadow-2xl">
            <button
              onClick={() => setShowProofFullImage(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={order.proofDesign?.mockupImageUrl || order.items[0]?.mockupUrl}
              alt="Full Mockup"
              className="max-h-[80vh] w-auto mx-auto rounded-2xl object-contain"
            />
            <p className="text-center text-xs font-bold text-slate-500 mt-2">
              Mockup Đơn Hàng: {order.orderCode} - {order.items[0]?.productName}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
