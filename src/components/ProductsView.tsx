import React, { useState } from 'react';
import {
  Gift,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Sparkles,
  Printer,
  Tag
} from 'lucide-react';
import { GiftProduct, PrintTechnique } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO } from '../data/mockData';

interface ProductsViewProps {
  products: GiftProduct[];
  onAddProduct: (product: GiftProduct) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onAddProduct,
  onUpdateStock,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<GiftProduct['category']>('binh_giu_nhiet');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(65000);
  const [newProdStock, setNewProdStock] = useState(100);
  const [newProdMaterial, setNewProdMaterial] = useState('');
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60');

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.material.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const newProd: GiftProduct = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      sku: newProdSku || `GIFT-${Math.floor(1000 + Math.random() * 9000)}`,
      basePrice: Number(newProdPrice),
      stockQuantity: Number(newProdStock),
      minStockAlert: 30,
      unit: 'Chiếc',
      imageUrl: newProdImg,
      material: newProdMaterial || 'Chất liệu tiêu chuẩn cao cấp',
      colors: ['Tiêu chuẩn'],
      compatibleTechniques: ['uv', 'laser'],
      description: 'Phôi quà tặng in khắc logo doanh nghiệp',
    };

    onAddProduct(newProd);
    setShowAddModal(false);
    setNewProdName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-blue-600" /> Danh Mục Phôi Quà Tặng & Báo Giá Sỉ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý kho phôi sẵn có: Bình giữ nhiệt, cốc sứ, bút ký, sổ tay da, áo đồng phục...
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm Phôi Quà Tặng Mới
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên phôi, mã SKU, chất liệu inox, gốm sứ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả danh mục phôi</option>
          <option value="binh_giu_nhiet">Bình giữ nhiệt</option>
          <option value="coc_su">Cốc sứ / Ly thủy tinh</option>
          <option value="but_ky">Bút ký cao cấp</option>
          <option value="so_tay">Sổ tay da PU</option>
          <option value="ky_niem_chuong">Kỷ niệm chương pha lê</option>
          <option value="tui_canvas">Túi vải Canvas</option>
          <option value="hop_qua_vip">Bộ Giftset VIP</option>
          <option value="ao_dong_phuc">Áo thun đồng phục</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((prod) => {
          const isLowStock = prod.stockQuantity <= prod.minStockAlert;
          return (
            <div
              key={prod.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                    {prod.sku}
                  </span>
                  {isLowStock ? (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-3 h-3" /> Sắp hết
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                      Còn {prod.stockQuantity} {prod.unit}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {prod.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {prod.material}
                </p>

                {/* Compatible Print Techniques */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {prod.compatibleTechniques.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {PRINT_TECHNIQUES_INFO[tech]?.name || tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Giá Phôi Sỉ</span>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(prod.basePrice)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const newQty = prompt(`Cập nhật số lượng tồn kho cho "${prod.name}":`, String(prod.stockQuantity));
                      if (newQty !== null && !isNaN(Number(newQty))) {
                        onUpdateStock(prod.id, Number(newQty));
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Sửa kho
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Thêm Phôi Quà Tặng Mới Vào Kho
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tên sản phẩm / phôi:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bình Giữ Nhiệt Vỏ Tre 450ml"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Mã SKU:</label>
                  <input
                    type="text"
                    placeholder="BGN-TRE-450"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Danh mục:</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="binh_giu_nhiet">Bình giữ nhiệt</option>
                    <option value="coc_su">Cốc sứ</option>
                    <option value="but_ky">Bút ký</option>
                    <option value="so_tay">Sổ da</option>
                    <option value="ky_niem_chuong">Pha lê</option>
                    <option value="tui_canvas">Túi canvas</option>
                    <option value="hop_qua_vip">Set VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Giá phôi (VNĐ):</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Số lượng nhập kho:</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Mô tả chất liệu:</label>
                <input
                  type="text"
                  placeholder="Vỏ tre tự nhiên ép nhiệt, ruột inox 304"
                  value={newProdMaterial}
                  onChange={(e) => setNewProdMaterial(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Lưu Phôi Quà Tặng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
