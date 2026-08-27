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
  CheckSquare
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusInfo, getPriorityInfo } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO } from '../data/mockData';

interface JobTicketModalProps {
  order: Order | null;
  onClose: () => void;
}

export const JobTicketModal: React.FC<JobTicketModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const priorityInfo = getPriorityInfo(order.priority);
  const statusInfo = getOrderStatusInfo(order.status);

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
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-blue-700">GIFTPRINT PRO</span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-900 text-white rounded">XƯỞNG IN QUÀ TẶNG</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Xưởng 1: Khu Công Nghiệp Cầu Giấy, Hà Nội | Hotline Kỹ Thuật: 0988.112.233</p>
              <p className="text-xs font-bold text-slate-900 uppercase mt-1">PHIẾU LỆNH SẢN XUẤT & KIỂM TRA CHẤT LƯỢNG (QC)</p>
            </div>

            <div className="text-right">
              <div className="inline-block p-2 border-2 border-dashed border-slate-800 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">Mã Lệnh Xưởng</p>
                <p className="text-lg font-black text-blue-700 tracking-wider">{order.orderCode}</p>
              </div>
              {order.priority !== 'binh_thuong' && (
                <p className="text-xs font-black text-rose-600 uppercase mt-1">
                  ⚡ MỨC ƯU TIÊN: {priorityInfo.label}
                </p>
              )}
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
              CHI TIẾT PHÔI QUÀ TẶNG & QUY CÁCH IN ẤN:
            </h4>
            <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-300 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Tên Phôi & Quy Cách</th>
                    <th className="py-2.5 px-3 text-center">Số Lượng</th>
                    <th className="py-2.5 px-3">Vị Trí & Kích Thước In</th>
                    <th className="py-2.5 px-3">Công Nghệ & Màu Sắc</th>
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
                        {item.quantity} chiếc
                      </td>
                      <td className="py-3 px-3">
                        {item.printPositions.map((pos, pIdx) => (
                          <div key={pIdx} className="mb-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">• {pos.name}:</span>{' '}
                            <span className="text-slate-600 dark:text-slate-400 font-mono">{pos.dimensions}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-3">
                        {item.printPositions.map((pos, pIdx) => (
                          <div key={pIdx} className="mb-1">
                            <span className="font-bold uppercase text-indigo-600">[{pos.technique}]</span>{' '}
                            <span className="text-slate-700 dark:text-slate-300">{pos.colors}</span>
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
                <span className="text-[11px] text-slate-400">(Xác nhận thông số in)</span>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white">KIỂM ĐỊNH QC XUẤT XƯỞNG</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[11px] text-slate-400">(Đã test độ bám dính)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
