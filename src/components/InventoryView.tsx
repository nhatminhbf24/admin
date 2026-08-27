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
  Truck,
  Calculator,
  Flame,
  Camera,
  FileSpreadsheet,
  AlertTriangle,
  TrendingDown,
  ShieldCheck,
  Tag,
  Clock,
  RotateCcw,
  Coffee,
  Key,
  Maximize,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { MaterialInventory, GiftProduct, DefectLog, Order, DefectReason } from '../types';
import { formatNumber, formatDate, formatCurrency } from '../utils/formatters';
import { DEFECT_REASONS_INFO } from '../data/mockData';

interface InventoryViewProps {
  products: GiftProduct[];
  materials: MaterialInventory[];
  defectLogs: DefectLog[];
  orders: Order[];
  onUpdateProductStock: (productId: string, delta: number) => void;
  onUpdateMaterialQuantity: (matId: string, delta: number) => void;
  onOpenDefectModal: (orderId?: string, productSku?: string) => void;
  onAddMaterial?: (material: MaterialInventory) => void;
  onAddProduct?: (product: GiftProduct) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  materials,
  defectLogs,
  orders,
  onUpdateProductStock,
  onUpdateMaterialQuantity,
  onOpenDefectModal,
  onAddMaterial,
  onAddProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'blanks' | 'materials' | 'defect_logs' | 'bom_formulas'>('blanks');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [defectFilter, setDefectFilter] = useState<string>('all');
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);

  // New material form state
  const [newMatName, setNewMatName] = useState('');
  const [newMatSku, setNewMatSku] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<MaterialInventory['category']>('giay_in_nhiet');
  const [newMatUnit, setNewMatUnit] = useState('Tờ');
  const [newMatQuantity, setNewMatQuantity] = useState(100);
  const [newMatMinAlert, setNewMatMinAlert] = useState(20);
  const [newMatUnitPrice, setNewMatUnitPrice] = useState(1500);
  const [newMatSupplier, setNewMatSupplier] = useState('');
  const [newMatNotes, setNewMatNotes] = useState('');

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) return;

    const generatedSku = newMatSku.trim() || `VT-${Date.now().toString().slice(-4)}`;
    const newMaterial: MaterialInventory = {
      id: `mat-${Date.now()}`,
      name: newMatName.trim(),
      sku: generatedSku,
      category: newMatCategory,
      quantity: Number(newMatQuantity) || 0,
      unit: newMatUnit.trim() || 'Cái',
      minAlert: Number(newMatMinAlert) || 10,
      unitPrice: Number(newMatUnitPrice) || 0,
      supplier: newMatSupplier.trim() || 'Nhà Cung Cấp Tổng Hợp',
      lastImportDate: new Date().toISOString().split('T')[0],
      notes: newMatNotes.trim(),
    };

    if (onAddMaterial) {
      onAddMaterial(newMaterial);
    }
    setIsAddMaterialModalOpen(false);
    // Reset form
    setNewMatName('');
    setNewMatSku('');
    setNewMatQuantity(100);
    setNewMatUnitPrice(1500);
    setNewMatNotes('');
  };

  // Filter Blank Items (Kho Phôi Trắng)
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter && p.serviceGroup !== categoryFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.material.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter Materials (Vật Tư Tiêu Hao)
  const filteredMaterials = materials.filter((m) => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q) || m.supplier.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter Defect Logs
  const filteredDefectLogs = defectLogs.filter((d) => {
    if (defectFilter !== 'all' && d.reason !== defectFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        d.productName.toLowerCase().includes(q) ||
        d.sku.toLowerCase().includes(q) ||
        (d.orderCode && d.orderCode.toLowerCase().includes(q)) ||
        d.technicianName.toLowerCase().includes(q) ||
        (d.customReasonNote && d.customReasonNote.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Defect Stats Calculation
  const totalScrappedItems = defectLogs.reduce((acc, curr) => acc + curr.quantityScrapped, 0);
  const totalScrappedCost = defectLogs.reduce((acc, curr) => acc + curr.estimatedCostLoss, 0);
  const totalProducedUnits = orders.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0), 0) || 1;
  const scrapRatePercent = ((totalScrappedItems / (totalProducedUnits + totalScrappedItems)) * 100).toFixed(1);

  const BOM_RECIPES = [
    {
      group: '🔥 In Chuyển Nhiệt',
      product: 'Ly Sứ Chuyển Nhiệt (Trắng / Đổi Màu / Quai Tim)',
      blanks: '1 Phôi Ly Sứ Chuẩn Men (Quai tròn, quai tim hoặc đổi màu magic)',
      paper: '1/3 Tờ Giấy Sublimation A4 Hàn Quốc (In 3 dải thân ly)',
      ink: '0.8 ml Mực In Chuyển Nhiệt Inktec CMYK',
      filmLamination: 'Không cần cán màng (Bám nhiệt trực tiếp vào men sứ)',
      notes: 'Ép nhiệt ở 190°C trong 180 giây trên máy ép cốc đôi ST-210.',
    },
    {
      group: '🔥 In Chuyển Nhiệt',
      product: 'Phôi Móc Khóa Mica / Gỗ Ép Nhiệt 2 Mặt',
      blanks: '1 Phôi Móc Khóa Mica Vuông / Tròn / Tim hoặc Gỗ MDF',
      paper: '2/12 Tờ Giấy Sublimation A4 (In 2 mặt đối xứng)',
      ink: '0.5 ml Mực In Chuyển Nhiệt',
      filmLamination: 'Bóc màng nilon bảo vệ mica trước khi ép',
      notes: 'Ép phẳng ở 185°C trong 60 giây, lực ép trung bình.',
    },
    {
      group: '🔥 In Chuyển Nhiệt',
      product: 'Phôi Đồng Hồ Tráng Gương / Đồng Hồ Gỗ 20x20cm',
      blanks: '1 Phôi Kính Tráng Gương hoặc Gỗ MDF Kèm Bộ Máy Kim Trôi',
      paper: '1 Tờ Giấy Sublimation A4/A3',
      ink: '1.2 ml Mực In Chuyển Nhiệt Inktec',
      filmLamination: 'Không cán màng (Ép mặt đáy tráng gương)',
      notes: 'Ép nhiệt ở 185°C trong 120-150 giây, lót vải cách nhiệt.',
    },
    {
      group: '🔥 In Chuyển Nhiệt',
      product: 'Phôi Mặt Đá Tự Nhiên In Ảnh (15x15, 20x20, 20x30cm)',
      blanks: '1 Phôi Tranh Đá Sơn Lót Men Phẳng (Kèm 2 chân đế)',
      paper: '1 Tờ Giấy Sublimation A4',
      ink: '1.2 ml Mực In Chuyển Nhiệt',
      filmLamination: 'Không cán màng',
      notes: 'Ép nhiệt ở 195°C trong 300-360 giây (đá dày cần lót đệm silicon cao su chịu nhiệt tránh nứt).',
    },
    {
      group: '📸 In Ảnh & Nhãn Vở',
      product: 'Set Nhãn Vở Bóc Dán Học Sinh (24-36 nhãn/set)',
      blanks: 'Set Nhãn Đã Cắt Bế Demi Theo Tên Bé',
      paper: '1-2 Tờ Decal Ảnh Đế Vàng A4 Chống Nước',
      ink: '1.0 ml Mực In Ảnh Pigment UV Chống Bay Màu',
      filmLamination: '0.3-0.6 Mét Màng Cán Hologram 7 Màu / Màng Bóng',
      notes: 'Cán màng bảo vệ sau khi in, đưa vào máy bế tem Graphtec đọc bon tự động.',
    },
    {
      group: '📸 In Ảnh & Nhãn Vở',
      product: 'Ảnh Kỷ Niệm Polaroid / Ảnh Lab (6x9, 10x15cm)',
      blanks: 'Tấm Ảnh Rời Cắt Vuông Vắn',
      paper: '1 Tờ Giấy In Ảnh RC Glossy 230gsm Khổ A4 (in 9 ảnh 6x9)',
      ink: '0.9 ml Mực In Ảnh Lab 6 Màu',
      filmLamination: '1 Tờ Màng Ép Plastic Cứng 80 Mic hoặc Cán Màng Lụa',
      notes: 'In sắc nét 5760x1440 dpi, ép nóng plastic hoặc cán nguội chống lóa.',
    },
    {
      group: '📸 In Ảnh & Nhãn Vở',
      product: 'Khung Ảnh Composite & Khung Gỗ (13x18, 15x21, 20x30cm)',
      blanks: '1 Phôi Khung Composite/Gỗ Kèm Chân Chống & Kính Mica',
      paper: '1 Tờ Giấy In Ảnh RC Khổ Tương Ứng',
      ink: '0.6 ml Mực In Ảnh Lab',
      filmLamination: 'Màng cán lụa chống lóa',
      notes: 'Lồng ảnh vào khung, lau sạch bụi kính trước khi gài chốt lưng.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" /> Quản Lý Kho Phôi & Vật Tư Tiêu Hao
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi tồn kho phôi ly sứ, móc khóa, đồng hồ tráng gương, mặt đá, khung ảnh, giấy in & sổ nhật ký hỏng phôi.
          </p>
        </div>

        {/* Action button & Tab Switch */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenDefectModal()}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Báo In Lại / Hỏng Phôi
          </button>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('blanks');
                setCategoryFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'blanks'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" /> Kho Phôi Trắng ({products.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('materials');
                setCategoryFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'materials'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Vật Tư Tiêu Hao ({materials.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('defect_logs');
                setCategoryFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'defect_logs'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Nhật Ký Hao Hụt ({defectLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('bom_formulas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'bom_formulas'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" /> Định Mức BOM
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: KHO PHÔI TRẮNG (BLANK ITEMS) */}
      {activeTab === 'blanks' && (
        <div className="space-y-4">
          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Phôi Ly Sứ</span>
                <Coffee className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {products
                  .filter((p) => p.category === 'ly_su')
                  .reduce((sum, p) => sum + p.stockQuantity, 0)}{' '}
                <span className="text-xs font-normal text-slate-500">cái</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ly trắng, quai tim, đổi màu</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">Phôi Móc Khóa</span>
                <Key className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {products
                  .filter((p) => p.category === 'moc_khoa')
                  .reduce((sum, p) => sum + p.stockQuantity, 0)}{' '}
                <span className="text-xs font-normal text-slate-500">cái</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Mica vuông/tròn/tim, gỗ MDF</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">Đồng Hồ & Mặt Đá</span>
                <ImageIcon className="w-4 h-4 text-cyan-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {products
                  .filter((p) => p.category === 'dong_ho' || p.category === 'tranh_da')
                  .reduce((sum, p) => sum + p.stockQuantity, 0)}{' '}
                <span className="text-xs font-normal text-slate-500">cái</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tráng gương, đá 15x15, 20x20...</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Khung Ảnh Các Size</span>
                <Maximize className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {products
                  .filter((p) => p.category === 'khung_anh')
                  .reduce((sum, p) => sum + p.stockQuantity, 0)}{' '}
                <span className="text-xs font-normal text-slate-500">cái</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Khung 13x18, 15x21, 20x30</p>
            </div>
          </div>

          {/* Table of Blank Items */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm phôi ly sứ, móc khóa, đồng hồ, tranh đá, khung ảnh..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">Tất cả danh mục phôi</option>
                <option value="ly_su">☕ Phôi Ly Sứ (Trắng, Tim, Đổi màu)</option>
                <option value="moc_khoa">🔑 Phôi Móc Khóa (Mica, Gỗ)</option>
                <option value="dong_ho">⏰ Phôi Đồng Hồ (Tráng gương, Gỗ)</option>
                <option value="tranh_da">🖼️ Phôi Mặt Đá Tự Nhiên (15x15, 20x20...)</option>
                <option value="khung_anh">📐 Khung Ảnh Composite / Gỗ (13x18, 15x21, 20x30)</option>
                <option value="in_nhan_vo">🏷️ Phôi Decal Nhãn Vở</option>
                <option value="ao_thun">👕 Áo Thun Chuyển Nhiệt</option>
                <option value="binh_giu_nhiet">💧 Bình Giữ Nhiệt Inox</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tên Phôi Trắng & SKU</th>
                    <th className="py-3 px-4">Quy Cách & Biến Thể</th>
                    <th className="py-3 px-4">Giá Phôi Gốc</th>
                    <th className="py-3 px-4">Tồn Kho</th>
                    <th className="py-3 px-4">Thông Số Ép / In Gợi Ý</th>
                    <th className="py-3 px-4 text-right">Thao Tác Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map((prod) => {
                    const isLow = prod.stockQuantity <= prod.minStockAlert;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-snug">{prod.name}</p>
                              <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">{prod.sku}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                              {prod.material}
                            </span>
                            {prod.colors && (
                              <p className="text-[10px] text-slate-400">
                                {prod.colors.slice(0, 2).join(' • ')}
                                {prod.colors.length > 2 && ` +${prod.colors.length - 2}`}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(prod.basePrice)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {formatNumber(prod.stockQuantity)}
                            </span>
                            <span className="text-slate-500 font-normal">{prod.unit}</span>
                          </div>
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 mt-0.5">
                              <AlertCircle className="w-2.5 h-2.5" /> Sắp hết (dưới {prod.minStockAlert})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 mt-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Sẵn sàng
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {prod.heatPressSpecs ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 px-2 py-0.5 rounded font-medium">
                              <Flame className="w-3 h-3 text-amber-500" /> {prod.heatPressSpecs.temperatureC}°C •{' '}
                              {prod.heatPressSpecs.timeSeconds}s
                            </span>
                          ) : prod.photoPrintSpecs ? (
                            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/30 px-2 py-0.5 rounded font-medium">
                              <Camera className="w-3 h-3 text-blue-500" /> {prod.photoPrintSpecs.lamination}
                            </span>
                          ) : (
                            'Chuẩn xưởng'
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenDefectModal(undefined, prod.sku)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                              title="Báo in lại hoặc hỏng phôi này"
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-500" /> Báo Hỏng
                            </button>

                            <button
                              onClick={() => onUpdateProductStock(prod.id, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold transition-colors text-xs"
                              title="Giảm 1 tồn kho"
                            >
                              -
                            </button>
                            <button
                              onClick={() => onUpdateProductStock(prod.id, 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold transition-colors text-xs"
                              title="Thêm 1 tồn kho"
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
      )}

      {/* TAB 2: VẬT TƯ TIÊU HAO (MATERIALS) */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Danh Mục Vật Tư</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{materials.length} Loại vật tư</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Cảnh Báo Chạm Ngưỡng Tồn</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {materials.filter((m) => m.quantity <= m.minAlert).length} Vật tư sắp hết
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Nhà Cung Cấp Vật Tư</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">6 Đối tác chính</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm tên giấy Sublimation, mực in, màng ép, khoen móc khóa, đế đá..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">Tất cả chủng loại</option>
                  <option value="muc_chuyen_nhiet">💧 Mực In Chuyển Nhiệt (Sublimation)</option>
                  <option value="muc_in_anh">🎨 Mực In Ảnh (Dye / Pigment)</option>
                  <option value="giay_in_nhiet">📄 Giấy In Nhiệt Subli Hàn Quốc</option>
                  <option value="giay_anh_decal">📸 Giấy In Ảnh RC Bóng/Mờ & Decal</option>
                  <option value="mang_can_plastic">✨ Màng Cán Bóng/Cát & Băng Keo Nhiệt</option>
                  <option value="phoi_phu_kien">🔑 Phụ Kiện (Khoen, Đế Đá, Ghim, Hộp Ly)</option>
                  <option value="hop_khung">📦 Phôi Khung & Hộp Quà Tặng</option>
                </select>

                <button
                  onClick={() => setIsAddMaterialModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Vật Tư Mới
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tên Vật Tư & Mã SKU</th>
                    <th className="py-3 px-4">Chủng Loại</th>
                    <th className="py-3 px-4">Đơn Giá Nhập</th>
                    <th className="py-3 px-4">Số Lượng Tồn Kho</th>
                    <th className="py-3 px-4">Trạng Thái Kho</th>
                    <th className="py-3 px-4">Nhà Cung Cấp</th>
                    <th className="py-3 px-4">Lần Nhập Gần Nhất</th>
                    <th className="py-3 px-4 text-right">Điều Chỉnh Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMaterials.map((mat) => {
                    const isLow = mat.quantity <= mat.minAlert;
                    return (
                      <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {mat.name}
                          <p className="text-[11px] font-mono text-slate-400 font-normal">{mat.sku}</p>
                          {mat.notes && <p className="text-[10px] text-slate-400 font-normal mt-0.5">{mat.notes}</p>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {mat.category === 'giay_in_nhiet'
                              ? 'Giấy In Nhiệt Subli'
                              : mat.category === 'giay_anh_decal'
                              ? 'Giấy Ảnh / Decal'
                              : mat.category === 'muc_chuyen_nhiet'
                              ? 'Mực In Sublimation'
                              : mat.category === 'muc_in_anh'
                              ? 'Mực In Ảnh Dye/Pigment'
                              : mat.category === 'mang_can_plastic'
                              ? 'Màng Cán / Keo Nhiệt'
                              : mat.category === 'hop_khung'
                              ? 'Phôi Khung & Hộp'
                              : 'Phụ Kiện Xưởng'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(mat.unitPrice || 0)} / {mat.unit}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                          {mat.quantity} <span className="font-normal text-xs text-slate-500">{mat.unit}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              <AlertCircle className="w-3 h-3" /> Cảnh báo sắp hết (&lt; {mat.minAlert})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Đủ dùng
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{mat.supplier}</td>
                        <td className="py-3.5 px-4 text-slate-500">{formatDate(mat.lastImportDate)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onUpdateMaterialQuantity(mat.id, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold transition-colors text-xs"
                              title="Trừ 1 đơn vị tồn kho"
                            >
                              -
                            </button>
                            <button
                              onClick={() => onUpdateMaterialQuantity(mat.id, 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold transition-colors text-xs"
                              title="Thêm 1 đơn vị tồn kho"
                            >
                              +
                            </button>
                            <button
                              onClick={() => onUpdateMaterialQuantity(mat.id, 10)}
                              className="px-1.5 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold transition-colors text-[10px]"
                              title="Nhập thêm 10 đơn vị"
                            >
                              +10
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
      )}

      {/* TAB 3: SỔ NHẬT KÝ HAO HỤT & HỎNG PHÔI (DEFECT & SCRAP LOGS) */}
      {activeTab === 'defect_logs' && (
        <div className="space-y-4">
          {/* Scrap Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase">Tổng Phôi Báo Hỏng</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {totalScrappedItems} <span className="text-xs font-normal text-slate-500">phôi</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Đã xuất bù từ kho tức thì</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase">Tỷ Lệ Lỗi / Hao Hụt</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {scrapRatePercent}% <span className="text-xs font-normal text-slate-500">sản lượng</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Mục tiêu xưởng: dưới 1.5%</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60">
              <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase">Chi Phí Xưởng Bù Phôi</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {formatCurrency(totalScrappedCost)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Không tính vào bill khách</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Chất Lượng Cam Kết</p>
              <div className="flex items-center gap-1.5 mt-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">100% Đạt Chuẩn</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Hàng lỗi loại bỏ trước khi giao</p>
            </div>
          </div>

          {/* Defect Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo mã đơn, sản phẩm, lý do, thợ phụ trách..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500"
                />
              </div>

              <select
                value={defectFilter}
                onChange={(e) => setDefectFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-rose-500 font-medium"
              >
                <option value="all">Tất cả nguyên nhân hỏng</option>
                <option value="chay_mau_nhiet">🔥 Cháy màu / Quá nhiệt khi ép</option>
                <option value="lech_tam_khuon">🎯 Lệch tâm / Lệch khung bế</option>
                <option value="vo_nut_phoi">⚠️ Vỡ ly sứ / Nứt mặt đá</option>
                <option value="lem_muc_bot_khi">💧 Lem mực / Bọt khí / Tróc men</option>
                <option value="loi_file_khach">📄 Lỗi file / Sai tên học sinh</option>
                <option value="khac">❓ Lý do khác</option>
              </select>

              <button
                onClick={() => onOpenDefectModal()}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Ghi Nhận Hỏng Phôi Mới
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Thời Gian & Mã Đơn</th>
                    <th className="py-3 px-4">Phôi Sản Phẩm</th>
                    <th className="py-3 px-4">SL Hỏng</th>
                    <th className="py-3 px-4">Nguyên Nhân Sự Cố</th>
                    <th className="py-3 px-4">Chi Tiết / Lý Do</th>
                    <th className="py-3 px-4">Kỹ Thuật Viên</th>
                    <th className="py-3 px-4 text-right">Chi Phí Bù</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDefectLogs.map((log) => {
                    const reasonInfo = DEFECT_REASONS_INFO[log.reason] || DEFECT_REASONS_INFO['khac'];
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {log.orderCode ? log.orderCode : <span className="text-slate-400">Không gắn đơn</span>}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {formatDate(log.timestamp)}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-[180px]">
                          {log.productName}
                          <p className="text-[10px] font-normal text-slate-400 font-mono">{log.sku}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs">
                            -{log.quantityScrapped} cái
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                            {reasonInfo.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[220px]">
                          <p className="text-[11px] line-clamp-2 leading-relaxed">
                            {log.customReasonNote || reasonInfo.desc}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                          {log.technicianName}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(log.estimatedCostLoss)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BOM RECIPES */}
      {activeTab === 'bom_formulas' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-200">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <Calculator className="w-4 h-4 text-purple-600" /> Bảng Công Thức Định Mức Tiêu Hao Vật Tư Chuẩn (BOM Standard)
            </p>
            <p className="mt-1 text-purple-700 dark:text-purple-300">
              Mỗi khi xưởng tạo đơn, xuất lệnh sản xuất hoặc bấm "Báo In Lại / Hỏng Phôi", hệ thống sẽ tự động nhân số lượng đặt với bảng định mức dưới đây để trừ kho giấy, mực, decal, màng cán và phôi tương ứng.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {BOM_RECIPES.map((recipe, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {recipe.product}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 rounded">
                    {recipe.group}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-slate-700 dark:text-slate-300">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Phôi sản phẩm:</p>
                    <p className="font-bold mt-0.5">{recipe.blanks}</p>
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Giấy in / Decal:</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{recipe.paper}</p>
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Mực tiêu hao:</p>
                    <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">{recipe.ink}</p>
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Màng cán / Ép:</p>
                    <p className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">{recipe.filmLamination}</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic pt-1">
                  💡 <strong>Kỹ thuật:</strong> {recipe.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD MATERIAL MODAL */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thêm Vật Tư / Mực In Mới</h3>
                  <p className="text-[11px] text-slate-400">Thêm thủ công các phụ liệu, giấy, mực, màng cán cho xưởng</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMaterialModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Vật Tư / Quy Cách <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  placeholder="VD: Mực in Sublimation Hàn Quốc 1000ml (Màu Cyan)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã SKU / Mã Quản Lý
                  </label>
                  <input
                    type="text"
                    value={newMatSku}
                    onChange={(e) => setNewMatSku(e.target.value)}
                    placeholder="VD: MUC-SUBLI-C"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chủng Loại Vật Tư
                  </label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="muc_chuyen_nhiet">Mực in Chuyển Nhiệt Sublimation</option>
                    <option value="muc_in_anh">Mực in Ảnh Dye / Pigment</option>
                    <option value="giay_in_nhiet">Giấy In Nhiệt Sublimation</option>
                    <option value="giay_anh_decal">Giấy In Ảnh & Decal</option>
                    <option value="mang_can_plastic">Màng Cán Bóng/Cát & Băng Keo Nhiệt</option>
                    <option value="phoi_phu_kien">Phụ Kiện (Khoen, Ghim, Đế đá, Hộp)</option>
                    <option value="hop_khung">Phôi Khung Ảnh & Bao Bì</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn Vị Tính
                  </label>
                  <input
                    type="text"
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value)}
                    placeholder="Tờ, Chai, Cuộn, Cái..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Lượng Tồn Ban Đầu
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMatQuantity}
                    onChange={(e) => setNewMatQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngưỡng Báo Hết
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMatMinAlert}
                    onChange={(e) => setNewMatMinAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn Giá Nhập (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={newMatUnitPrice}
                    onChange={(e) => setNewMatUnitPrice(Number(e.target.value))}
                    placeholder="VD: 150000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nhà Cung Cấp
                  </label>
                  <input
                    type="text"
                    value={newMatSupplier}
                    onChange={(e) => setNewMatSupplier(e.target.value)}
                    placeholder="VD: In Ấn Sài Gòn / Kim Điệp"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Kỹ Thuật / Vị Trí Kệ
                </label>
                <textarea
                  rows={2}
                  value={newMatNotes}
                  onChange={(e) => setNewMatNotes(e.target.value)}
                  placeholder="VD: Kệ A3 tầng 2, dùng chuyên cho máy Epson L8050"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Lưu Vào Kho Vật Tư
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
