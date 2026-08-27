import React, { useState } from 'react';
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
  Thermometer,
  Camera,
  Scissors
} from 'lucide-react';
import { Machine, PrintServiceGroup } from '../types';
import { formatDate } from '../utils/formatters';

interface MachinesViewProps {
  machines: Machine[];
  onToggleStatus?: (machineId: string) => void;
}

export const MachinesView: React.FC<MachinesViewProps> = ({
  machines = [],
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | PrintServiceGroup>('all');

  const filteredMachines = (machines || []).filter((m) => {
    if (selectedFilter !== 'all' && m.serviceGroup !== selectedFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" /> Dàn Máy In & Thiết Bị Ép Nhiệt Xưởng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi trạng thái máy in phun chuyển nhiệt, máy ép ly, máy ép phẳng, máy cán màng và máy cắt bế decal.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất Cả Máy ({machines.length})
          </button>
          <button
            onClick={() => setSelectedFilter('chuyen_nhiet')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              selectedFilter === 'chuyen_nhiet'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Dàn In Chuyển Nhiệt & Ép Nhiệt
          </button>
          <button
            onClick={() => setSelectedFilter('in_anh_thuong')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              selectedFilter === 'in_anh_thuong'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Dàn In Ảnh, Dập Huy Hiệu & Cán Bế
          </button>
        </div>
      </div>

      {/* Machine Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredMachines.map((mac) => {
          const isSub = mac.serviceGroup === 'chuyen_nhiet';

          return (
            <div
              key={mac.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {mac.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isSub
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}
                      >
                        {isSub ? '🔥 Ép Nhiệt' : '📸 In Ảnh / Màng'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                      {mac.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {mac.type}
                    </p>
                  </div>

                  {mac.status === 'dang_in' ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Đang chạy
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
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
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 mb-3">
                    Máy đang trong trạng thái chờ nhận lệnh in mới
                  </div>
                )}

                {/* Machine specs & Location */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kỹ thuật viên: <strong className="text-slate-800 dark:text-slate-200">{mac.operator}</strong></span>
                  </div>

                  {mac.temperature && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                      <span>Thông số máy: <strong className="text-slate-800 dark:text-slate-200">{mac.temperature}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Bảo trì gần nhất: {formatDate(mac.maintenanceDate)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Vị trí: {mac.location}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Chuẩn vận hành
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
