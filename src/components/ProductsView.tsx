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
  Tag,
  Flame,
  Camera,
  Layers,
  Thermometer,
  Clock,
  Settings2
} from 'lucide-react';
import { GiftProduct, PrintTechnique, ProductCategory, PrintServiceGroup } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { PRINT_TECHNIQUES_INFO, PRODUCT_CATEGORIES_INFO, PRINT_SERVICE_GROUPS } from '../data/mockData';

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
  const [selectedGroup, setSelectedGroup] = useState<'all' | PrintServiceGroup>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product state
  const [newProdName, setNewProdName] = useState('');
  const [newProdGroup, setNewProdGroup] = useState<PrintServiceGroup>('chuyen_nhiet');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('ly_su');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(25000);
  const [newProdStock, setNewProdStock] = useState(200);
  const [newProdMaterial, setNewProdMaterial] = useState('');
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60');
  const [newProdTemp, setNewProdTemp] = useState(190);
  const [newProdTime, setNewProdTime] = useState(180);
  const [newProdMachine, setNewProdMachine] = useState('Máy ép ly đôi ST-210');

  const filteredProducts = products.filter((p) => {
    if (selectedGroup !== 'all' && p.serviceGroup !== selectedGroup) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        (PRODUCT_CATEGORIES_INFO[p.category]?.name || '').toLowerCase().includes(q)
      );
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
      serviceGroup: newProdGroup,
      sku: newProdSku || `GIFT-${Math.floor(1000 + Math.random() * 9000)}`,
      basePrice: Number(newProdPrice),
      stockQuantity: Number(newProdStock),
      minStockAlert: 30,
      unit: newProdCategory === 'in_nhan_vo' ? 'Gói' : newProdCategory === 'anh_ky_niem' ? 'Tấm' : 'Chiếc',
      imageUrl: newProdImg,
      material: newProdMaterial || 'Chất liệu tiêu chuẩn xưởng in quà tặng',
      colors: ['Tiêu chuẩn'],
      compatibleTechniques: newProdGroup === 'chuyen_nhiet' ? ['chuyen_nhiet'] : ['in_anh_lab', 'in_decal'],
      heatPressSpecs: newProdGroup === 'chuyen_nhiet' ? {
        temperatureC: newProdTemp,
        timeSeconds: newProdTime,
        pressure: 'vừa',
        recommendedMachine: newProdMachine,
        paperType: 'Giấy in nhiệt Sublimation Hàn Quốc',
      } : undefined,
      description: 'Phôi sản phẩm phục vụ in ấn theo yêu cầu',
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
            <Gift className="w-5 h-5 text-blue-600" /> Danh Mục Sản Phẩm & Phôi In Quà Tặng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý chi tiết 11 sản phẩm In Chuyển Nhiệt & 3 sản phẩm In Ảnh / Nhãn Vở với thông số kỹ thuật ép nhiệt xưởng.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm Sản Phẩm / Phôi Mới
        </button>
      </div>

      {/* Group Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setSelectedGroup('all');
            setSelectedCategory('all');
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            selectedGroup === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tất Cả Sản Phẩm ({products.length})
        </button>
        <button
          onClick={() => {
            setSelectedGroup('chuyen_nhiet');
            setSelectedCategory('all');
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
            selectedGroup === 'chuyen_nhiet'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> In Chuyển Nhiệt (11 Nhóm Phôi)
        </button>
        <button
          onClick={() => {
            setSelectedGroup('in_anh_thuong');
            setSelectedCategory('all');
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
            selectedGroup === 'in_anh_thuong'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
          }`}
        >
          <Camera className="w-3.5 h-3.5" /> In Ảnh & Nhãn Vở (3 Nhóm)
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên phôi, mã SKU, chất liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Sub Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả phân loại chi tiết</option>
          {Object.entries(PRODUCT_CATEGORIES_INFO).map(([key, info]) => (
            <option key={key} value={key}>
              {info.name} ({info.group === 'chuyen_nhiet' ? 'Nhiệt' : 'Ảnh'})
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => {
          const isLowStock = prod.stockQuantity <= prod.minStockAlert;
          const catInfo = PRODUCT_CATEGORIES_INFO[prod.category];
          const isSublimation = prod.serviceGroup === 'chuyen_nhiet';

          return (
            <div
              key={prod.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        isSublimation
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isSublimation ? '🔥 In Chuyển Nhiệt' : '📸 In Ảnh & Decal'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-md">
                      {catInfo?.name || prod.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {formatCurrency(prod.basePrice)} / {prod.unit}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                        {prod.sku}
                      </span>
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          isLowStock ? 'text-rose-500 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        Tồn: <strong className="text-slate-800 dark:text-slate-200">{formatNumber(prod.stockQuantity)}</strong> {prod.unit}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 line-clamp-2">
                      {prod.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {prod.material}
                  </p>

                  {/* Technical Heat Press Parameters / Photo specs */}
                  {prod.heatPressSpecs ? (
                    <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-bold">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-amber-600" /> {prod.heatPressSpecs.temperatureC}°C
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> {prod.heatPressSpecs.timeSeconds}s
                        </span>
                        <span className="capitalize">Lực {prod.heatPressSpecs.pressure}</span>
                      </div>
                      <p className="text-amber-800/80 dark:text-amber-400 text-[10px] truncate">
                        Máy: {prod.heatPressSpecs.recommendedMachine}
                      </p>
                    </div>
                  ) : prod.photoPrintSpecs ? (
                    <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-[11px] space-y-1">
                      <p className="font-bold text-blue-900 dark:text-blue-300 truncate">
                        {prod.photoPrintSpecs.paperType}
                      </p>
                      <p className="text-blue-800/80 dark:text-blue-400 text-[10px] truncate">
                        {prod.photoPrintSpecs.lamination}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    defaultValue={prod.stockQuantity}
                    onBlur={(e) => onUpdateStock(prod.id, Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-slate-800 dark:text-slate-200"
                  />
                  <span className="text-[10px] text-slate-400">cập nhật kho</span>
                </div>

                <span className="text-[11px] text-slate-400 italic">
                  Cảnh báo: &lt;{prod.minStockAlert}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Thêm Sản Phẩm / Phôi Mới
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mảng dịch vụ:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewProdGroup('chuyen_nhiet');
                      setNewProdCategory('ly_su');
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                      newProdGroup === 'chuyen_nhiet'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Flame className="w-4 h-4" /> In Chuyển Nhiệt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProdGroup('in_anh_thuong');
                      setNewProdCategory('in_nhan_vo');
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                      newProdGroup === 'in_anh_thuong'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Camera className="w-4 h-4" /> In Ảnh & Nhãn Vở
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phân loại chi tiết:</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                >
                  {Object.entries(PRODUCT_CATEGORIES_INFO)
                    .filter(([_, info]) => info.group === newProdGroup)
                    .map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên sản phẩm / phôi:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Ly sứ quai tim đổi màu ma thuật 350ml"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Giá phôi (VNĐ):</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số lượng nhập kho:</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {newProdGroup === 'chuyen_nhiet' && (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-2">
                  <label className="block font-bold text-amber-900 dark:text-amber-300">Thông số kỹ thuật ép nhiệt:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500">Nhiệt độ (°C):</span>
                      <input
                        type="number"
                        value={newProdTemp}
                        onChange={(e) => setNewProdTemp(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 rounded-lg px-2 py-1"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Thời gian (giây):</span>
                      <input
                        type="number"
                        value={newProdTime}
                        onChange={(e) => setNewProdTime(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 rounded-lg px-2 py-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ảnh đại diện (URL):</label>
                <input
                  type="text"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
