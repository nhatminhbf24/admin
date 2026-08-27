import React from 'react';
import {
  Printer,
  X,
  Download,
  Calendar,
  Building2,
  Phone,
  Layers,
  Sparkles,
  QrCode,
  CheckSquare,
  Flame,
  Camera,
  Thermometer,
  Clock,
  Package,
  Users
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusInfo, getPriorityInfo } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO, PRODUCT_CATEGORIES_INFO } from '../data/mockData';
import { calculateOrderBOM } from '../utils/bomCalculator';
import { generateVietQrUrl, formatPaymentContent, DEFAULT_BANK_CONFIG } from '../utils/vietQrHelper';

interface JobTicketModalProps {
  order: Order | null;
  onClose: () => void;
}

export const JobTicketModal: React.FC<JobTicketModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const priorityInfo = getPriorityInfo(order.priority);
  const statusInfo = getOrderStatusInfo(order.status);
  const isSublimation = order.serviceGroup === 'chuyen_nhiet';
  const bomReport = calculateOrderBOM(order);

  // Sinh VietQR cho phiếu xưởng
  const qrTransferContent = formatPaymentContent(order.orderCode, order.customerName, 'full');
  const qrImageUrl = generateVietQrUrl(
    order.totalAmount - order.depositAmount > 0 ? order.totalAmount - order.depositAmount : order.totalAmount,
    qrTransferContent,
    DEFAULT_BANK_CONFIG,
    'compact'
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Phiếu Lệnh Sản Xuất Xưởng In (Job Ticket #{order.orderCode})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" /> In Phiếu Xưởng
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Content */}
        <div className="p-8 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 space-y-6">
          {/* Header Ticket */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-blue-700">GIFTPRINT PRO</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 text-white rounded ${
                    isSublimation ? 'bg-amber-600' : 'bg-blue-600'
                  }`}
                >
                  {isSublimation ? '🔥 XƯỞNG ÉP NHIỆT SUBLIMATION' : '📸 XƯỞNG IN ẢNH & DECAL'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Xưởng sản xuất: Lô B3 Xưởng In Quà Tặng Theo Yêu Cầu | Hotline Kỹ Thuật: 0988.112.233</p>
              <p className="text-xs font-bold text-slate-900 uppercase mt-1">PHIẾU LỆNH SẢN XUẤT & ĐỊNH MỨC VẬT TƯ (BOM)</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:block w-20 h-20 border border-slate-200 rounded-lg p-1 bg-white">
                <img src={qrImageUrl} alt="QR Phiếu Xưởng" className="w-full h-full object-contain" />
              </div>
              <div className="text-right">
                <div className="inline-block p-2 border-2 border-dashed border-slate-800 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Mã Lệnh Xưởng</p>
                  <p className="text-lg font-black text-blue-700 tracking-wider">{order.orderCode}</p>
                </div>
                {order.priority !== 'binh_thuong' && (
                  <p className="text-xs font-black text-rose-600 uppercase mt-1">
                    ⚡ {priorityInfo.label}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-slate-500 font-semibold">Khách Hàng / Đơn Vị:</p>
              <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{order.customerCompany || order.customerName}</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">SĐT: {order.customerPhone}</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">Địa chỉ giao: {order.shippingAddress}</p>
            </div>

            <div>
              <p className="text-slate-500 font-semibold">Thông Tin Xưởng & Tiến Độ:</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                Kỹ thuật viên phụ trách: <span className="text-blue-600">{order.assignedTechnician || 'Phân công xưởng trưởng'}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                Ngày nhận lệnh: {formatDateTime(order.createdAt)}
              </p>
              <p className="text-rose-600 font-bold mt-0.5">
                ⏰ HẠN HOÀN TẤT XUẤT XƯỞNG: {formatDate(order.deadline)}
              </p>
            </div>
          </div>

          {/* Print Specifications Table */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-2">
              CHI TIẾT SẢN PHẨM & THÔNG SỐ CÀI ĐẶT MÁY IN / MÁY ÉP:
            </h4>
            <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-300 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Tên Sản Phẩm & Phôi</th>
                    <th className="py-2.5 px-3 text-center">Số Lượng</th>
                    <th className="py-2.5 px-3">Quy Cách & Thông Số Ép / Cán Màng</th>
                    <th className="py-2.5 px-3 text-center">Duyệt File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">SKU: {item.sku}</p>
                        {item.notes && (
                          <p className="text-[11px] text-blue-600 italic mt-0.5">{item.notes}</p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-sm text-blue-700">
                        {item.quantity} {item.category === 'in_nhan_vo' ? 'set' : item.category === 'anh_ky_niem' ? 'tấm' : 'chiếc'}
                      </td>
                      <td className="py-3 px-3">
                        {/* Heat press parameters if available */}
                        {item.heatPressSpecs ? (
                          <div className="p-2 bg-amber-50 rounded-lg text-[11px] text-amber-900 font-medium space-y-0.5 mb-1.5">
                            <p className="font-bold text-amber-950 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-600" /> Cài đặt máy ép nhiệt:
                            </p>
                            <p>
                              • Nhiệt độ: <strong>{item.heatPressSpecs.temperatureC}°C</strong> | Thời gian: <strong>{item.heatPressSpecs.timeSeconds}s</strong> | Lực: <strong>{item.heatPressSpecs.pressure}</strong>
                            </p>
                            <p>• Máy khuyên dùng: {item.heatPressSpecs.recommendedMachine}</p>
                            <p>• Giấy in: {item.heatPressSpecs.paperType}</p>
                          </div>
                        ) : item.photoPrintSpecs ? (
                          <div className="p-2 bg-blue-50 rounded-lg text-[11px] text-blue-900 font-medium space-y-0.5 mb-1.5">
                            <p className="font-bold text-blue-950 flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5 text-blue-600" /> Quy cách in ảnh / nhãn:
                            </p>
                            <p>• Giấy: {item.photoPrintSpecs.paperType}</p>
                            <p>• Cán màng: {item.photoPrintSpecs.lamination}</p>
                            {item.photoPrintSpecs.photoSize && <p>• Kích thước: {item.photoPrintSpecs.photoSize}</p>}
                          </div>
                        ) : null}

                        {item.printPositions.map((pos, pIdx) => (
                          <div key={pIdx} className="text-[11px] text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">• {pos.name}:</span>{' '}
                            <span>{pos.dimensions} ({pos.colors})</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.proofApproved ? (
                          <span className="font-bold text-emerald-600">✓ Đã duyệt file</span>
                        ) : (
                          <span className="font-bold text-amber-600">Chờ duyệt</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOM Material Consumption Checklist */}
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-purple-900 dark:text-purple-300 uppercase flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-600" /> Bảng Định Mức Vật Tư Xuất Xưởng (BOM Checklist):
              </strong>
              <span className="text-[11px] text-purple-700 font-semibold">Thợ phụ trách ký nhận khi lấy phôi & giấy</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {bomReport.totalConsumptions.map((b, bIdx) => (
                <div key={bIdx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-purple-100">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    [ ] {b.materialName}
                  </span>
                  <span className="font-bold text-purple-700">
                    {b.totalQuantity} {b.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Names list if available */}
          {order.items.some((it) => it.customNames && it.customNames.length > 0) && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs space-y-1.5">
              <strong className="text-blue-900 dark:text-blue-300 uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" /> Danh Sách Tên Riêng Cần In Từng Sản Phẩm:
              </strong>
              {order.items.map((it, idx) => (
                it.customNames && (
                  <div key={idx} className="flex flex-wrap gap-1.5 pt-1">
                    {it.customNames.map((name, nIdx) => (
                      <span key={nIdx} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-blue-200 rounded text-[11px] font-medium">
                        {nIdx + 1}. {name}
                      </span>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Workshop Notes */}
          {order.productionNotes && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs">
              <strong className="text-amber-800 dark:text-amber-300">Lưu Ý Kỹ Thuật Từ Trưởng Xưởng:</strong>
              <p className="text-amber-900 dark:text-amber-200 mt-0.5">{order.productionNotes}</p>
            </div>
          )}

          {/* QC Checklist & Signature */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">NGƯỜI LẬP LỆNH</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[11px] text-slate-400">(Ký & ghi rõ họ tên)</span>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white">KỸ THUẬT VẬN HÀNH MÁY</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[11px] text-slate-400">(Đã test nhiệt & màu)</span>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white">KIỂM ĐỊNH QC XUẤT XƯỞNG</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[11px] text-slate-400">(Kiểm tra độ bám & trầy)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
