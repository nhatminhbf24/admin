import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Droplets,
  Truck
} from 'lucide-react';
import { MaterialInventory } from '../types';
import { formatNumber, formatDate } from '../utils/formatters';

interface InventoryViewProps {
  materials: MaterialInventory[];
  onAddMaterial: (material: MaterialInventory) => void;
  onUpdateQuantity: (matId: string, delta: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  materials,
  onAddMaterial,
  onUpdateQuantity,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = materials.filter((m) => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q) || m.supplier.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" /> Quản Lý Vật Tư & Mực In Xưởng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi tồn kho mực in UV, film DTF bóc nóng, nhũ ép kim 18K, keo nhiệt và bao bì đóng gói.
          </p>
        </div>
      </div>

      {/* Filter and stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Loại Vật Tư</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{materials.length} Danh mục</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Vật Tư Cần Nhập Thêm</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {materials.filter((m) => m.quantity <= m.minAlert).length} Cảnh báo
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Nhà Cung Cấp Liên Kết</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">6 Đối tác</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên mực, film DTF, nhũ ép kim..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả chủng loại</option>
            <option value="muc_in">Mực in UV / Chuyển nhiệt</option>
            <option value="film_dtf">Film & Màng in DTF</option>
            <option value="hop_dung">Hộp đựng & Túi giấy</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Tên Vật Tư & Mã SKU</th>
                <th className="py-3 px-4">Chủng Loại</th>
                <th className="py-3 px-4">Số Lượng Tồn</th>
                <th className="py-3 px-4">Trạng Thái Kho</th>
                <th className="py-3 px-4">Nhà Cung Cấp</th>
                <th className="py-3 px-4">Lần Nhập Gần Nhất</th>
                <th className="py-3 px-4 text-right">Điều Chỉnh Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((mat) => {
                const isLow = mat.quantity <= mat.minAlert;
                return (
                  <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {mat.name}
                      <p className="text-[11px] font-normal text-slate-400">{mat.sku}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {mat.category === 'muc_in' ? 'Mực In UV/Laser' : mat.category === 'film_dtf' ? 'Màng Film' : 'Hộp & Bao Bì'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {mat.quantity} <span className="font-normal text-slate-500">{mat.unit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          <AlertCircle className="w-3 h-3" /> Cảnh báo sắp hết
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Đủ dùng
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {mat.supplier}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(mat.lastImportDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onUpdateQuantity(mat.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold transition-colors"
                          title="Trừ tồn kho"
                        >
                          -
                        </button>
                        <button
                          onClick={() => onUpdateQuantity(mat.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold transition-colors"
                          title="Thêm tồn kho"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
