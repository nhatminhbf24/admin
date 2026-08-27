import React, { useState, useMemo } from 'react';
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
  Flame,
  Camera,
  FileSpreadsheet,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Tag,
  Clock,
  RotateCcw,
  Coffee,
  Key,
  Maximize,
  Image as ImageIcon,
  X,
  Scale,
  ArrowDownRight,
  ArrowUpRight,
  User,
  Building,
  DollarSign,
  Filter,
  History,
  FileText
} from 'lucide-react';
import {
  MaterialInventory,
  GiftProduct,
  Order,
  InventoryTransactionLog,
  InventoryTransactionType,
  DefectReason
} from '../types';
import { formatNumber, formatDate, formatCurrency } from '../utils/formatters';
import { DEFECT_REASONS_INFO, PRODUCT_CATEGORIES_INFO } from '../data/mockData';

interface InventoryViewProps {
  products: GiftProduct[];
  materials: MaterialInventory[];
  transactions: InventoryTransactionLog[];
  orders: Order[];
  onRecordTransaction: (
    txData: Omit<InventoryTransactionLog, 'id' | 'timestamp'>
  ) => void;
  onAddProduct?: (product: GiftProduct) => void;
  onAddMaterial?: (material: MaterialInventory) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products = [],
  materials = [],
  transactions = [],
  orders = [],
  onRecordTransaction,
  onAddProduct,
  onAddMaterial,
}) => {
  // Main 2 Tabs: "ton_kho" (Bảng Tồn Kho Hiện Tại) & "the_kho" (Sổ Lịch Sử Biến Động)
  const [activeMainTab, setActiveMainTab] = useState<'ton_kho' | 'the_kho'>('ton_kho');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'warning' | 'ok'>('all');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAddBlankModalOpen, setIsAddBlankModalOpen] = useState(false);

  // Selected item for quick action modals
  const [selectedTargetItem, setSelectedTargetItem] = useState<{
    id: string;
    name: string;
    sku: string;
    unit: string;
    stock: number;
    basePrice: number;
    itemType: 'phoi_san_pham' | 'vat_tu';
  } | null>(null);

  // Import Modal Form state (Thao tác tay nhập kho)
  const [importItemId, setImportItemId] = useState<string>('');
  const [importSupplier, setImportSupplier] = useState<string>('Xưởng Gốm Sứ Bát Tràng Pro');
  const [importQuantity, setImportQuantity] = useState<number>(100);
  const [importUnitPrice, setImportUnitPrice] = useState<number>(20000);
  const [importReferenceId, setImportReferenceId] = useState<string>(`PN-${Date.now().toString().slice(-6)}`);
  const [importNotes, setImportNotes] = useState<string>('');
  const [importPerformer, setImportPerformer] = useState<string>('Thủ kho');

  // Scrap Modal Form state (Báo hỏng phôi / Xuất hao hụt tại xưởng)
  const [scrapQuantity, setScrapQuantity] = useState<number>(1);
  const [scrapReason, setScrapReason] = useState<DefectReason>('chay_mau_nhiet');
  const [scrapOrderCode, setScrapOrderCode] = useState<string>('');
  const [scrapTechnician, setScrapTechnician] = useState<string>('Trần Hải Đăng (Thợ in)');
  const [scrapNotes, setScrapNotes] = useState<string>('Ép nhiệt bị cháy phôi');

  // Audit / Balance Modal Form state (Kiểm kê cuối tháng)
  const [auditActualCount, setAuditActualCount] = useState<number>(0);
  const [auditPerformer, setAuditPerformer] = useState<string>('Quản lý xưởng');
  const [auditNotes, setAuditNotes] = useState<string>('Kiểm kê cân bằng kho định kỳ');

  // Add new Blank / Material Form state
  const [newBlankName, setNewBlankName] = useState('');
  const [newBlankSku, setNewBlankSku] = useState('');
  const [newBlankGroup, setNewBlankGroup] = useState<GiftProduct['serviceGroup']>('chuyen_nhiet');
  const [newBlankCategory, setNewBlankCategory] = useState<GiftProduct['category']>('ly_su');
  const [newBlankPrice, setNewBlankPrice] = useState<number>(25000);
  const [newBlankStock, setNewBlankStock] = useState<number>(100);
  const [newBlankMinAlert, setNewBlankMinAlert] = useState<number>(20);
  const [newBlankUnit, setNewBlankUnit] = useState('Chiếc');
  const [newBlankMaterial, setNewBlankMaterial] = useState('Sứ trắng tráng men bóng cao cấp');
  const [newBlankImg, setNewBlankImg] = useState('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60');
  const [newBlankDesc, setNewBlankDesc] = useState('');

  // Combine Products & Materials into a unified stock list
  const allStockItems = useMemo(() => {
    const productList = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      categoryLabel: PRODUCT_CATEGORIES_INFO[p.category]?.name || 'Phôi Quà Tặng',
      stock: p.stockQuantity,
      unit: p.unit,
      minAlert: p.minStockAlert,
      unitPrice: p.basePrice,
      totalValue: p.stockQuantity * p.basePrice,
      isLowStock: p.stockQuantity <= p.minStockAlert,
      itemType: 'phoi_san_pham' as const,
      imageUrl: p.imageUrl,
      serviceGroup: p.serviceGroup,
    }));

    const materialList = materials.map((m) => ({
      id: m.id,
      name: m.name,
      sku: m.sku,
      category: m.category,
      categoryLabel:
        m.category === 'giay_in_nhiet'
          ? 'Giấy In Nhiệt'
          : m.category === 'giay_anh_decal'
          ? 'Giấy Ảnh / Decal'
          : m.category === 'muc_chuyen_nhiet'
          ? 'Mực Chuyển Nhiệt'
          : m.category === 'muc_in_anh'
          ? 'Mực In Ảnh'
          : m.category === 'mang_can_plastic'
          ? 'Màng Cán Hologram/Bóng'
          : m.category === 'hop_khung'
          ? 'Hộp Quà & Khung'
          : 'Vật Tư Phụ Kiện',
      stock: m.quantity,
      unit: m.unit,
      minAlert: m.minAlert,
      unitPrice: m.unitPrice || 15000,
      totalValue: m.quantity * (m.unitPrice || 15000),
      isLowStock: m.quantity <= m.minAlert,
      itemType: 'vat_tu' as const,
      imageUrl: undefined,
      serviceGroup: undefined,
    }));

    return [...productList, ...materialList];
  }, [products, materials]);

  // Filtered Stock Items for Tab 1
  const filteredStockItems = useMemo(() => {
    return allStockItems.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        categoryFilter === 'all' ||
        (categoryFilter === 'phoi' && item.itemType === 'phoi_san_pham') ||
        (categoryFilter === 'vat_tu' && item.itemType === 'vat_tu') ||
        item.category === categoryFilter;

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'warning' && item.isLowStock) ||
        (statusFilter === 'ok' && !item.isLowStock);

      return matchSearch && matchCat && matchStatus;
    });
  }, [allStockItems, search, categoryFilter, statusFilter]);

  // Summary Metrics (3 thẻ đếm đầu trang)
  const metrics = useMemo(() => {
    const totalItems = allStockItems.length;
    const lowStockCount = allStockItems.filter((i) => i.isLowStock).length;
    const totalInventoryValue = allStockItems.reduce((sum, i) => sum + i.totalValue, 0);

    return {
      totalItems,
      lowStockCount,
      totalInventoryValue,
    };
  }, [allStockItems]);

  // Filtered Transaction Logs for Tab 2
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.itemName.toLowerCase().includes(search.toLowerCase()) ||
        tx.itemSku.toLowerCase().includes(search.toLowerCase()) ||
        (tx.referenceId && tx.referenceId.toLowerCase().includes(search.toLowerCase())) ||
        (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));

      const matchType = txTypeFilter === 'all' || tx.type === txTypeFilter;

      return matchSearch && matchType;
    });
  }, [transactions, search, txTypeFilter]);

  // Quick Open Import Modal for specific item or general
  const handleOpenImportModal = (target?: typeof allStockItems[0]) => {
    if (target) {
      setSelectedTargetItem({
        id: target.id,
        name: target.name,
        sku: target.sku,
        unit: target.unit,
        stock: target.stock,
        basePrice: target.unitPrice,
        itemType: target.itemType,
      });
      setImportItemId(target.id);
      setImportUnitPrice(target.unitPrice);
    } else {
      const first = allStockItems[0];
      setSelectedTargetItem(
        first
          ? {
              id: first.id,
              name: first.name,
              sku: first.sku,
              unit: first.unit,
              stock: first.stock,
              basePrice: first.unitPrice,
              itemType: first.itemType,
            }
          : null
      );
      setImportItemId(first?.id || '');
      setImportUnitPrice(first?.unitPrice || 20000);
    }
    setImportQuantity(100);
    setImportReferenceId(`PN-${Date.now().toString().slice(-6)}`);
    setImportNotes('');
    setIsImportModalOpen(true);
  };

  // Submit Import Modal
  const handleSubmitImport = (e: React.FormEvent) => {
    e.preventDefault();
    const item = allStockItems.find((i) => i.id === importItemId);
    if (!item || importQuantity <= 0) return;

    const stockBefore = item.stock;
    const stockAfter = stockBefore + Number(importQuantity);

    onRecordTransaction({
      itemId: item.id,
      itemName: item.name,
      itemSku: item.sku,
      itemType: item.itemType,
      unit: item.unit,
      type: 'NHAP',
      quantityDelta: Number(importQuantity),
      stockBefore,
      stockAfter,
      referenceId: importReferenceId || `PN-${Date.now().toString().slice(-6)}`,
      supplier: importSupplier || 'Nhà Cung Cấp Tổng Hợp',
      unitPrice: Number(importUnitPrice),
      totalValue: Number(importQuantity) * Number(importUnitPrice),
      performer: importPerformer || 'Thủ kho',
      notes: importNotes.trim() || `Nhập kho ${importQuantity} ${item.unit} từ ${importSupplier}`,
    });

    setIsImportModalOpen(false);
  };

  // Quick Open Scrap Modal
  const handleOpenScrapModal = (target: typeof allStockItems[0]) => {
    setSelectedTargetItem({
      id: target.id,
      name: target.name,
      sku: target.sku,
      unit: target.unit,
      stock: target.stock,
      basePrice: target.unitPrice,
      itemType: target.itemType,
    });
    setScrapQuantity(1);
    setScrapReason('chay_mau_nhiet');
    setScrapOrderCode(orders[0]?.orderCode || '');
    setScrapNotes('Ép nhiệt bị cháy / lỗi kỹ thuật trong ca');
    setIsScrapModalOpen(true);
  };

  // Submit Scrap Modal (XUAT_HU)
  const handleSubmitScrap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetItem || scrapQuantity <= 0) return;

    const stockBefore = selectedTargetItem.stock;
    const stockAfter = Math.max(0, stockBefore - Number(scrapQuantity));
    const reasonInfo = DEFECT_REASONS_INFO[scrapReason];

    onRecordTransaction({
      itemId: selectedTargetItem.id,
      itemName: selectedTargetItem.name,
      itemSku: selectedTargetItem.sku,
      itemType: selectedTargetItem.itemType,
      unit: selectedTargetItem.unit,
      type: 'XUAT_HU',
      quantityDelta: -Number(scrapQuantity),
      stockBefore,
      stockAfter,
      referenceId: scrapOrderCode || undefined,
      unitPrice: selectedTargetItem.basePrice,
      totalValue: Number(scrapQuantity) * selectedTargetItem.basePrice,
      performer: scrapTechnician || 'Thợ in xưởng',
      notes: `Hao hụt / Hỏng phôi: ${reasonInfo?.label || ''}. ${scrapNotes.trim()}`,
    });

    setIsScrapModalOpen(false);
  };

  // Quick Open Audit Modal
  const handleOpenAuditModal = (target: typeof allStockItems[0]) => {
    setSelectedTargetItem({
      id: target.id,
      name: target.name,
      sku: target.sku,
      unit: target.unit,
      stock: target.stock,
      basePrice: target.unitPrice,
      itemType: target.itemType,
    });
    setAuditActualCount(target.stock);
    setAuditNotes('Kiểm kê kho thực tế định kỳ');
    setIsAuditModalOpen(true);
  };

  // Submit Audit Modal (KIEM_KE)
  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetItem) return;

    const stockBefore = selectedTargetItem.stock;
    const stockAfter = Math.max(0, Number(auditActualCount));
    const delta = stockAfter - stockBefore;

    onRecordTransaction({
      itemId: selectedTargetItem.id,
      itemName: selectedTargetItem.name,
      itemSku: selectedTargetItem.sku,
      itemType: selectedTargetItem.itemType,
      unit: selectedTargetItem.unit,
      type: 'KIEM_KE',
      quantityDelta: delta,
      stockBefore,
      stockAfter,
      referenceId: `KK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
      performer: auditPerformer || 'Quản lý xưởng',
      notes: `Kiểm kê thực tế: Sổ sách ${stockBefore}, thực tế đếm ${stockAfter} (${delta >= 0 ? `+${delta}` : delta} ${selectedTargetItem.unit}). ${auditNotes}`,
    });

    setIsAuditModalOpen(false);
  };

  // Create new blank handler
  const handleCreateBlank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlankName.trim()) return;

    const generatedSku = newBlankSku.trim() || `GIFT-${newBlankCategory.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProduct: GiftProduct = {
      id: `prod-${Date.now()}`,
      name: newBlankName.trim(),
      sku: generatedSku,
      category: newBlankCategory,
      serviceGroup: newBlankGroup,
      basePrice: Number(newBlankPrice) || 0,
      stockQuantity: Number(newBlankStock) || 0,
      minStockAlert: Number(newBlankMinAlert) || 20,
      unit: newBlankUnit.trim() || 'Chiếc',
      material: newBlankMaterial.trim() || 'Chất liệu tiêu chuẩn xưởng quà tặng',
      imageUrl: newBlankImg.trim() || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
      colors: ['Tiêu chuẩn'],
      compatibleTechniques: newBlankGroup === 'chuyen_nhiet' ? ['chuyen_nhiet'] : ['in_anh_lab', 'in_decal'],
      description: newBlankDesc.trim() || 'Phôi quà tặng in ấn theo yêu cầu',
    };

    if (onAddProduct) {
      onAddProduct(newProduct);
    }

    // Log initial import
    onRecordTransaction({
      itemId: newProduct.id,
      itemName: newProduct.name,
      itemSku: newProduct.sku,
      itemType: 'phoi_san_pham',
      unit: newProduct.unit,
      type: 'NHAP',
      quantityDelta: newProduct.stockQuantity,
      stockBefore: 0,
      stockAfter: newProduct.stockQuantity,
      referenceId: 'TAO-MOI',
      unitPrice: newProduct.basePrice,
      totalValue: newProduct.stockQuantity * newProduct.basePrice,
      performer: 'Quản lý xưởng',
      notes: 'Khởi tạo phôi quà tặng mới vào kho',
    });

    setIsAddBlankModalOpen(false);
    setNewBlankName('');
    setNewBlankSku('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-rose-500" /> Quản Lý Xuất / Nhập / Tồn (XNT) Xưởng In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tự động hóa theo dõi luồng Phôi & Vật tư: Nhập kho, Xuất đơn, Báo hỏng phôi và Kiểm kê cân bằng.
          </p>
        </div>

        {/* 2 Dedicated Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveMainTab('ton_kho')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeMainTab === 'ton_kho'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" /> Bảng Tồn Kho Hiện Tại (Tổng Quan)
          </button>
          <button
            onClick={() => setActiveMainTab('the_kho')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeMainTab === 'the_kho'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> Sổ Lịch Sử Biến Động (Thẻ Kho)
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-400 text-white font-mono">
              {transactions.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3 Summary Metric Cards (Đầu Trang) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng Mặt Hàng Quản Lý
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.totalItems}{' '}
              <span className="text-xs font-normal text-slate-400">mã phôi & vật tư</span>
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between transition-all ${
            metrics.lowStockCount > 0
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 ring-1 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Sắp Hết Phôi (Cảnh Báo Đỏ)
            </p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {metrics.lowStockCount}{' '}
              <span className="text-xs font-normal text-rose-500/80">mặt hàng cần nhập</span>
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng Giá Trị Tồn Kho
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(metrics.totalInventoryValue)}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ======================= TAB 1: BẢNG TỒN KHO HIỆN TẠI ======================= */}
      {activeMainTab === 'ton_kho' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Action Bar & Filters */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã SKU, tên phôi ly sứ, móc khóa, decal, mực, giấy..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500"
              />
            </div>

            {/* Filter Selects & Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-rose-500 font-medium"
              >
                <option value="all">Tất cả nhóm hàng</option>
                <option value="phoi">📦 Tất cả Phôi Quà Tặng (11 loại)</option>
                <option value="vat_tu">🧪 Tất cả Vật Tư & Mực (Giấy, Decal, Màng...)</option>
                <option value="ly_su">☕ Phôi Ly Sứ (Trắng, Tim, Đổi màu)</option>
                <option value="moc_khoa">🔑 Phôi Móc Khóa Mica/Gỗ</option>
                <option value="dong_ho">⏰ Phôi Đồng Hồ Tráng Gương</option>
                <option value="tranh_da">🖼️ Phôi Mặt Đá Tự Nhiên</option>
                <option value="in_nhan_vo">🏷️ Decal Nhãn Vở</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-rose-500 font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="warning">🚨 Sắp hết (Tồn &le; Ngưỡng báo động)</option>
                <option value="ok">✅ Đủ hàng tồn kho</option>
              </select>

              {/* Main Action Buttons */}
              <button
                onClick={() => handleOpenImportModal()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> + Nhập Kho Vật Tư / Phôi
              </button>

              <button
                onClick={() => setIsAddBlankModalOpen(true)}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-500/20 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> + Thêm Mặt Hàng Mới
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mã SKU</th>
                  <th className="py-3 px-4">Tên Phôi / Vật Tư</th>
                  <th className="py-3 px-4">Phân Loại</th>
                  <th className="py-3 px-4 text-center">Tồn Kho Thực Tế</th>
                  <th className="py-3 px-4 text-center">Đơn Vị</th>
                  <th className="py-3 px-4 text-right">Đơn Giá Vốn</th>
                  <th className="py-3 px-4 text-right">Tổng Giá Trị</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Hành Động Tại Xưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredStockItems.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {item.name}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              Ngưỡng báo động: {item.minAlert} {item.unit}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.categoryLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-sm font-black font-mono ${
                            item.isLowStock
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatNumber(item.stock)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">
                        {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 font-semibold font-mono">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.totalValue)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Sắp hết hàng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Đủ dùng
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Import Button */}
                          <button
                            onClick={() => handleOpenImportModal(item)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors font-bold text-[11px] flex items-center gap-1"
                            title="Nhập thêm hàng vào kho"
                          >
                            <Plus className="w-3.5 h-3.5" /> Nhập
                          </button>

                          {/* Quick Scrap Button (Báo hao hụt hỏng phôi) */}
                          <button
                            onClick={() => handleOpenScrapModal(item)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors font-bold text-[11px] flex items-center gap-1"
                            title="Báo hao hụt / Hỏng phôi khi ép nhiệt"
                          >
                            <Flame className="w-3.5 h-3.5" /> Báo hỏng
                          </button>

                          {/* Quick Audit Balance Button (Kiểm kê cân bằng) */}
                          <button
                            onClick={() => handleOpenAuditModal(item)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold text-[11px] flex items-center gap-1"
                            title="Kiểm kê cân bằng kho thực tế"
                          >
                            <Scale className="w-3.5 h-3.5" /> Kiểm kê
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
      )}

      {/* ======================= TAB 2: SỔ LỊCH SỬ BIẾN ĐỘNG (THẺ KHO) ======================= */}
      {activeMainTab === 'the_kho' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Action Bar & Transaction Filters */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã đơn, tên mặt hàng, mã SKU, chứng từ..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-rose-500 font-medium"
              >
                <option value="all">Tất cả loại giao dịch (4 loại)</option>
                <option value="NHAP">🟢 NHAP - Nhập kho từ Nhà Cung Cấp</option>
                <option value="XUAT_DON">🔵 XUAT_DON - Xuất kho theo đơn hàng</option>
                <option value="XUAT_HU">🔴 XUAT_HU - Xuất hao hụt / Hỏng phôi</option>
                <option value="KIEM_KE">🟣 KIEM_KE - Kiểm kê cân bằng kho</option>
              </select>

              <button
                onClick={() => handleOpenImportModal()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Ghi Phiếu Nhập Kho
              </button>
            </div>
          </div>

          {/* Transactions Timeline Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4">Mặt Hàng & SKU</th>
                  <th className="py-3 px-4 text-center">Loại Giao Dịch</th>
                  <th className="py-3 px-4 text-center">Biến Động (+/-)</th>
                  <th className="py-3 px-4 text-center">Tồn Sau GD</th>
                  <th className="py-3 px-4">Mã Đơn / Chứng Từ</th>
                  <th className="py-3 px-4">Người Thực Hiện</th>
                  <th className="py-3 px-4">Ghi Chú & Lý Do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Chưa có giao dịch biến động nào khớp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isPositive = tx.quantityDelta > 0;
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {formatDate(tx.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {tx.itemName}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {tx.itemSku}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {tx.type === 'NHAP' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              NHẬP KHO
                            </span>
                          )}
                          {tx.type === 'XUAT_DON' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                              XUẤT ĐƠN HÀNG
                            </span>
                          )}
                          {tx.type === 'XUAT_HU' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                              XUẤT HAO HỤT
                            </span>
                          )}
                          {tx.type === 'KIEM_KE' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                              KIỂM KÊ KHO
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-xs font-black font-mono inline-flex items-center gap-0.5 ${
                              isPositive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {isPositive ? `+${tx.quantityDelta}` : tx.quantityDelta} {tx.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatNumber(tx.stockAfter)} {tx.unit}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {tx.referenceId || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {tx.performer}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {tx.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= POPUP 1: NHẬP KHO (THAO TÁC TAY) ======================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Phiếu Nhập Kho Phôi & Vật Tư Mới
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cập nhật tồn kho (+Số lượng) và sinh lịch sử giao dịch 'NHAP'
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitImport} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chọn Loại Phôi / Vật Tư Nhập <span className="text-rose-500">*</span>
                </label>
                <select
                  value={importItemId}
                  onChange={(e) => {
                    setImportItemId(e.target.value);
                    const item = allStockItems.find((i) => i.id === e.target.value);
                    if (item) setImportUnitPrice(item.unitPrice);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                  required
                >
                  {allStockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name} (Tồn hiện tại: {item.stock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nhà Cung Cấp / Xưởng Gốc
                  </label>
                  <input
                    type="text"
                    required
                    value={importSupplier}
                    onChange={(e) => setImportSupplier(e.target.value)}
                    placeholder="VD: Xưởng Sứ Bát Tràng, Tổng Kho Giấy Á Châu..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Phiếu Nhập / Hóa Đơn
                  </label>
                  <input
                    type="text"
                    value={importReferenceId}
                    onChange={(e) => setImportReferenceId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Lượng Nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={importQuantity}
                    onChange={(e) => setImportQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn Giá Nhập (VNĐ / đơn vị)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={importUnitPrice}
                    onChange={(e) => setImportUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Total Calculated Import Cost */}
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Tổng Tiền Thanh Toán Nhập Hàng:
                </span>
                <span className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(Number(importQuantity) * Number(importUnitPrice))}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Người Nhập Hàng
                  </label>
                  <input
                    type="text"
                    value={importPerformer}
                    onChange={(e) => setImportPerformer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi Chú Đợt Nhập
                  </label>
                  <input
                    type="text"
                    value={importNotes}
                    onChange={(e) => setImportNotes(e.target.value)}
                    placeholder="VD: Hàng loại 1 chuẩn men bóng..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lưu Phiếu Nhập & Cộng Tồn Kho (+{importQuantity})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= POPUP 2: BÁO HỎNG PHÔI / XUẤT HAO HỤT (XUAT_HU) ======================= */}
      {isScrapModalOpen && selectedTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Báo Hỏng Phôi / Hao Hụt Ép Nhiệt
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Trừ phôi hỏng và tính vào giá vốn hao hụt của xưởng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScrapModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitScrap} className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">{selectedTargetItem.name}</p>
                <div className="flex items-center justify-between mt-1 text-slate-500 text-[11px]">
                  <span>Mã SKU: <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedTargetItem.sku}</strong></span>
                  <span>Tồn hiện tại: <strong className="text-slate-800 dark:text-slate-200">{selectedTargetItem.stock} {selectedTargetItem.unit}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Lượng Phôi Hỏng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedTargetItem.stock}
                    required
                    value={scrapQuantity}
                    onChange={(e) => setScrapQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-600 font-black text-sm outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Đơn Hàng (Nếu có)
                  </label>
                  <input
                    type="text"
                    value={scrapOrderCode}
                    onChange={(e) => setScrapOrderCode(e.target.value)}
                    placeholder="VD: GIFT-2608-02"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nguyên Nhân Gây Hỏng Phôi
                </label>
                <select
                  value={scrapReason}
                  onChange={(e) => setScrapReason(e.target.value as DefectReason)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-rose-500"
                >
                  <option value="chay_mau_nhiet">🔥 Cháy màu / Quá nhiệt khi ép cốc / áo</option>
                  <option value="vo_nut_phoi">💥 Vỡ ly sứ / Nứt mặt đá khi ép lực mạnh</option>
                  <option value="lech_tam_khuon">📐 Lệch tâm / Lệch khuôn bế decal</option>
                  <option value="lem_muc_bot_khi">💧 Lem mực / Bọt khí khi cán màng</option>
                  <option value="loi_file_khach">📄 Sai file in / Nhầm tên học sinh</option>
                  <option value="khac">🔧 Khác (Ghi chú chi tiết)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thợ In / Kỹ Thuật Báo Hỏng
                </label>
                <input
                  type="text"
                  value={scrapTechnician}
                  onChange={(e) => setScrapTechnician(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả & Ghi Chú Sự Cố
                </label>
                <input
                  type="text"
                  value={scrapNotes}
                  onChange={(e) => setScrapNotes(e.target.value)}
                  placeholder="VD: Khuôn ép nhiệt bị rơ-le 215°C..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-2.5 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-rose-800 dark:text-rose-300">
                  Giá Vốn Hao Hụt Xưởng Chịu:
                </span>
                <span className="font-bold font-mono text-rose-700 dark:text-rose-300">
                  {formatCurrency(Number(scrapQuantity) * selectedTargetItem.basePrice)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScrapModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" /> Xác Nhận Trừ Hao Hụt (-{scrapQuantity} {selectedTargetItem.unit})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= POPUP 3: KIỂM KÊ / CÂN BẰNG KHO (KIEM_KE) ======================= */}
      {isAuditModalOpen && selectedTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Kiểm Kê & Cân Bằng Kho Cuối Tháng
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Đối chiếu số đếm thực tế với phần mềm & tự sinh log 'KIEM_KE'
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAudit} className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">{selectedTargetItem.name}</p>
                <div className="flex items-center justify-between mt-1 text-slate-500 text-[11px]">
                  <span>Mã SKU: <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedTargetItem.sku}</strong></span>
                  <span>Tồn trên phần mềm: <strong className="text-slate-800 dark:text-slate-200">{selectedTargetItem.stock} {selectedTargetItem.unit}</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số Lượng Đếm Thực Tế Trong Xưởng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={auditActualCount}
                  onChange={(e) => setAuditActualCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-black text-base outline-none focus:border-purple-500"
                />
              </div>

              {/* Real-time Delta Feedback */}
              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900/50 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-purple-900 dark:text-purple-200 block">
                    Chênh Lệch Điều Chỉnh:
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Phần mềm sẽ tự động sinh bút toán 'KIEM_KE'
                  </span>
                </div>
                <span
                  className={`text-sm font-black font-mono ${
                    Number(auditActualCount) - selectedTargetItem.stock < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : Number(auditActualCount) - selectedTargetItem.stock > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {Number(auditActualCount) - selectedTargetItem.stock > 0 ? '+' : ''}
                  {Number(auditActualCount) - selectedTargetItem.stock} {selectedTargetItem.unit}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Người Kiểm Kê
                </label>
                <input
                  type="text"
                  value={auditPerformer}
                  onChange={(e) => setAuditPerformer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Kiểm Kê
                </label>
                <input
                  type="text"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20 transition-colors flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" /> Lưu Cân Bằng Kho Thực Tế ({auditActualCount} {selectedTargetItem.unit})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= POPUP 4: THÊM MẶT HÀNG PHÔI TRẮNG MỚI ======================= */}
      {isAddBlankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Thêm Phôi Quà Tặng / Vật Tư Mới
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Nhập thủ công phôi ly sứ, móc khóa, đồng hồ, tranh đá, kỷ niệm chương...
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBlankModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlank} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Phôi Trắng / Sản Phẩm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newBlankName}
                    onChange={(e) => setNewBlankName(e.target.value)}
                    placeholder="VD: Ly Sứ Men Màu Pastel Hồng Quai Tim 350ml"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã SKU Phôi (Để trống sẽ tự sinh)
                  </label>
                  <input
                    type="text"
                    value={newBlankSku}
                    onChange={(e) => setNewBlankSku(e.target.value)}
                    placeholder="VD: PHOI-LY-PINK-01"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dây Chuyền Công Nghệ
                  </label>
                  <select
                    value={newBlankGroup}
                    onChange={(e) => {
                      const grp = e.target.value as GiftProduct['serviceGroup'];
                      setNewBlankGroup(grp);
                      if (grp === 'in_anh_thuong') {
                        setNewBlankCategory('anh_ky_niem');
                        setNewBlankUnit('Tấm');
                      } else {
                        setNewBlankCategory('ly_su');
                        setNewBlankUnit('Chiếc');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="chuyen_nhiet">🔥 In Chuyển Nhiệt Sublimation (Ly, Móc khóa, Tranh đá...)</option>
                    <option value="in_anh_thuong">📸 In Ảnh Kỹ Thuật Số & Nhãn Vở (Decal, Lab, Khung...)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phân Loại Sản Phẩm
                  </label>
                  <select
                    value={newBlankCategory}
                    onChange={(e) => {
                      const cat = e.target.value as GiftProduct['category'];
                      setNewBlankCategory(cat);
                      if (cat === 'ly_su') {
                        setNewBlankUnit('Chiếc');
                        setNewBlankMaterial('Sứ phủ men bóng Sublimation');
                      } else if (cat === 'moc_khoa') {
                        setNewBlankUnit('Chiếc');
                        setNewBlankMaterial('Mica đúc trong suốt / Gỗ MDF');
                      } else if (cat === 'in_nhan_vo') {
                        setNewBlankUnit('Gói');
                        setNewBlankMaterial('Decal ảnh bóc dán đế vàng');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="ly_su">☕ Ly Sứ Quà Tặng (Trắng, Men màu, Đổi màu)</option>
                    <option value="moc_khoa">🔑 Móc Khóa (Mica, Gỗ MDF, Kim loại)</option>
                    <option value="dong_ho">⏰ Đồng Hồ Tráng Gương / Gỗ</option>
                    <option value="tranh_da">🖼️ Tranh Đá Tự Nhiên (15x15, 20x20...)</option>
                    <option value="huy_hieu">🎖️ Huy Hiệu Cài Áo / Mở Bia</option>
                    <option value="ao_thun">👕 Áo Thun / Túi Canvas In Nhiệt</option>
                    <option value="binh_giu_nhiet">💧 Bình Giữ Nhiệt Khắc / In Nhiệt</option>
                    <option value="in_nhan_vo">🏷️ Decal Nhãn Vở Học Sinh Theo Tên</option>
                    <option value="anh_ky_niem">📸 Ảnh Kỷ Niệm Polaroid / Lab</option>
                    <option value="khung_anh">📐 Khung Ảnh Để Bàn & Treo Tường</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chất Liệu & Quy Cách
                  </label>
                  <input
                    type="text"
                    value={newBlankMaterial}
                    onChange={(e) => setNewBlankMaterial(e.target.value)}
                    placeholder="VD: Sứ tráng men bóng cao cấp"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Giá Vốn Phôi (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={newBlankPrice}
                    onChange={(e) => setNewBlankPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Lượng Tồn Ban Đầu
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newBlankStock}
                    onChange={(e) => setNewBlankStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn Vị Tính
                  </label>
                  <input
                    type="text"
                    value={newBlankUnit}
                    onChange={(e) => setNewBlankUnit(e.target.value)}
                    placeholder="Chiếc, Tấm, Gói..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Link Ảnh Mẫu Phôi
                </label>
                <input
                  type="url"
                  value={newBlankImg}
                  onChange={(e) => setNewBlankImg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px] outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBlankModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Lưu Vào Kho & Ghi Phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
