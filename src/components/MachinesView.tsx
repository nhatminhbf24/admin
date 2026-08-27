import React from 'react';
import {
  Cpu,
  Zap,
  Flame,
  Sun,
  Layers,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Thermometer
} from 'lucide-react';
import { Machine } from '../types';
import { formatDate } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO } from '../data/mockData';

interface MachinesViewProps {
  machines: Machine[];
  onToggleStatus?: (machineId: string) => void;
}

export const MachinesView: React.FC<MachinesViewProps> = ({
  machines,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" /> Hệ Thống Máy Móc & Thiết Bị In Xưởng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Giám sát thời gian thực công suất máy in UV phẳng, máy khắc laser fiber, dàn ép kim và sấy DTF.
          </p>
        </div>
      </div>

      {/* Machine Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {machines.map((mac) => {
          const techInfo = PRINT_TECHNIQUES_INFO[mac.type];
          return (
            <div
              key={mac.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {mac.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                      {mac.name}
                    </h3>
                  </div>

                  {mac.status === 'dang_in' ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Đang chạy
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Sẵn sàng
                    </span>
                  )}
                </div>

                {/* Job progress */}
                {mac.currentJob ? (
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 mb-3">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                      Lệnh In Hiện Tại: {mac.currentJob.orderCode}
                    </p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
                      {mac.currentJob.productName}
                    </p>

                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span>Tiến độ máy:</span>
                        <span>{mac.currentJob.progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${mac.currentJob.progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 text-right mt-1">
                        Dự kiến xong: {mac.currentJob.estimatedFinish}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center mb-3">
                    <p className="text-xs text-slate-400">Máy đang rảnh, sẵn sàng nạp phôi & lệnh in</p>
                  </div>
                )}

                {/* Specs */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Kỹ thuật vận hành: <strong className="text-slate-800 dark:text-slate-200">{mac.operator}</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Thermometer className="w-3.5 h-3.5 text-slate-400" /> Thông số buồng: {mac.temperature || 'Tiêu chuẩn 25°C'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Bảo dưỡng gần nhất: {formatDate(mac.maintenanceDate)}
                  </p>
                </div>
              </div>

              {/* Location Tag */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Vị trí: {mac.location}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
