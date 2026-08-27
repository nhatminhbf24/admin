export type OrderStatus = 
  | 'tiep_nhan'      // Tiếp nhận & Báo giá
  | 'duyet_mockup'    // Chờ duyệt mockup thiết kế
  | 'che_ban'         // Đang chế bản / Xuất phim / Set máy
  | 'dang_in'         // Đang in ấn / ép nhiệt / in ảnh
  | 'gia_cong'        // Gia công cắt bế, cán màng, QC & Đóng gói
  | 'hoan_tat'        // Đã hoàn tất & Giao hàng
  | 'huy_don';        // Hủy đơn

export type PrintServiceGroup = 'chuyen_nhiet' | 'in_anh_thuong';

export type PrintTechnique = 
  | 'chuyen_nhiet'// In Chuyển nhiệt / Sublimation (Ly sứ, Áo, Móc khóa, Tranh đá...)
  | 'in_anh_lab'  // In Ảnh Kỹ Thuật Số / Rửa ảnh / In Lab
  | 'in_decal'    // In Decal Sticker & Bế Tem Nhãn Vở
  | 'ep_plastic'  // Ép Plastic & Cán Màng Nhiệt / Hologram
  | 'uv'          // In UV Phẳng
  | 'laser';      // Khắc Laser

export type ProductCategory = 
  // In Chuyển Nhiệt:
  | 'ly_su'           // Ly sứ / Cốc sứ trắng, lòng màu, đổi màu
  | 'moc_khoa'        // Móc khóa mica, gỗ, nhôm in nhiệt
  | 'huy_hieu'        // Huy hiệu cài áo, nam châm, mở bia
  | 'dong_ho'         // Đồng hồ gỗ, kính, pha lê
  | 'ao_thun'         // Áo thun poly/cotton in nhiệt
  | 'binh_giu_nhiet'  // Bình giữ nhiệt phủ men chuyển nhiệt
  | 'ky_niem_chuong'  // Kỷ niệm chương / Pha lê in nhiệt
  | 'tranh_da'        // Tranh đá tự nhiên in chuyển nhiệt
  | 'tranh_ghep'      // Tranh ghép hình Puzzle
  | 'tui_vai'         // Túi vải canvas / túi tote
  | 'bop_but_3d'      // Bóp bút 3D / Hộp bút học sinh
  // In Ảnh Thường:
  | 'in_nhan_vo'      // In nhãn vở theo yêu cầu (kèm ảnh/tên bé)
  | 'anh_ky_niem'     // Ảnh kỷ niệm (Polaroid, 6x9, 10x15, ép lụa/plastic)
  | 'khung_anh';      // Khung ảnh để bàn, treo tường

export type PaymentStatus = 'chua_coc' | 'da_coc_50' | 'da_tat_toan' | 'cong_no';

export type PriorityLevel = 'binh_thuong' | 'gap' | 'hoa_toc';

export interface HeatPressSpecs {
  temperatureC: number;     // Nhiệt độ (°C) VD: 180°C - 200°C
  timeSeconds: number;      // Thời gian ép (giây) VD: 60s, 180s, 300s
  pressure: 'nhẹ' | 'vừa' | 'mạnh'; // Lực ép
  recommendedMachine: string; // VD: "Máy ép ly đôi", "Máy ép phẳng 38x38", "Máy ép chân không 3D"
  paperType: string;         // VD: "Giấy in nhiệt Sublimation Hàn Quốc", "Màng chuyển nhiệt"
}

export interface PhotoPrintSpecs {
  paperType: string;         // VD: "Giấy ảnh RC bóng Glossy 230gsm", "Decal bóc dán đế vàng"
  lamination: string;        // VD: "Cán màng bóng", "Cán màng mờ", "Cán màng Hologram 7 màu", "Ép Plastic 80mic"
  photoSize?: string;        // VD: "6x9 cm", "10x15 cm", "13x18 cm", "Combo 32 nhãn"
}

export interface PrintPosition {
  id: string;
  name: string; // VD: "Quanh thân ly 360", "Mặt trước A4", "2 mặt móc khóa"
  dimensions: string; // VD: "20 x 8.5 cm", "A4 (21 x 29.7 cm)"
  colors: string; // VD: "Full color CMYK chuyển nhiệt", "In ảnh sắc nét phủ bóng"
  technique: PrintTechnique;
}

export interface OrderItem {
  id: string;
  productName: string; 
  sku: string;
  category: ProductCategory;
  serviceGroup: PrintServiceGroup;
  quantity: number;
  unitPrice: number;
  printPricePerUnit: number;
  printPositions: PrintPosition[];
  heatPressSpecs?: HeatPressSpecs;
  photoPrintSpecs?: PhotoPrintSpecs;
  mockupUrl: string;
  proofApproved: boolean;
  notes?: string;
  customNames?: string[]; // Danh sách tên riêng / hình riêng từng cái
}

export interface Order {
  id: string;
  orderCode: string; // VD: "ORD-2026-089"
  customerName: string;
  customerPhone: string;
  customerCompany?: string;
  customerEmail?: string;
  serviceGroup: PrintServiceGroup;
  status: OrderStatus;
  priority: PriorityLevel;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
  deadline: string;
  assignedTechnician?: string;
  items: OrderItem[];
  shippingAddress: string;
  productionNotes?: string;
}

export interface GiftProduct {
  id: string;
  name: string;
  category: ProductCategory;
  serviceGroup: PrintServiceGroup;
  sku: string;
  basePrice: number; // Giá phôi
  stockQuantity: number;
  minStockAlert: number;
  unit: string;
  imageUrl: string;
  material: string;
  colors?: string[];
  compatibleTechniques: PrintTechnique[];
  heatPressSpecs?: HeatPressSpecs;
  photoPrintSpecs?: PhotoPrintSpecs;
  description: string;
  popularFormats?: string[]; // VD: ["6x9 cm", "10x15 cm", "A4", "Khung 15x21"]
}

export interface Machine {
  id: string;
  name: string;
  code: string;
  serviceGroup: PrintServiceGroup;
  type: string;
  status: 'dang_in' | 'san_sang' | 'bao_tri' | 'tat_may';
  currentJob?: {
    orderCode: string;
    productName: string;
    progressPercent: number;
    estimatedFinish: string;
  };
  operator: string;
  location: string;
  temperature?: string;
  maintenanceDate: string;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  taxCode?: string;
  phone: string;
  email: string;
  address: string;
  type: 'ca_nhan' | 'truong_hoc' | 'dai_ly_qua_tang' | 'b2b_doanh_nghiep';
  totalOrders: number;
  totalSpent: number;
  discountRate: number; // %
  debtAmount: number;
  notes?: string;
}

export interface MaterialInventory {
  id: string;
  name: string;
  category: 'giay_in_nhiet' | 'giay_anh_decal' | 'muc_chuyen_nhiet' | 'muc_in_anh' | 'mang_can_plastic' | 'phoi_phu_kien' | 'hop_khung';
  sku: string;
  quantity: number;
  unit: string;
  minAlert: number;
  supplier: string;
  lastImportDate: string;
  unitPrice?: number;
  notes?: string;
}

export interface QuotePricingFormula {
  serviceGroup: PrintServiceGroup;
  productId: string;
  quantity: number;
  technique: PrintTechnique;
  printPositionsCount: number;
  laminationOption?: 'khong_can' | 'can_bong' | 'can_mo' | 'can_hologram' | 'ep_plastic';
  frameOption?: 'khong_khung' | 'khung_composite_de_ban' | 'khung_go_treo_tuong' | 'khung_led_pha_le';
  packagingOption: 'khong_hop' | 'hop_carton' | 'hop_xi_lot_lua' | 'tui_kraft';
  personalizeNamesCount: number;
  hasUrgentFee: boolean;
}

export type DefectReason = 
  | 'chay_mau_nhiet'    // Ép nhiệt bị cháy màu / Quá nhiệt / Quá thời gian
  | 'lech_tam_khuon'    // Lệch tâm / In lệch vị trí / Cắt bế lệch bon
  | 'vo_nut_phoi'       // Vỡ ly sứ / Nứt mặt đá tự nhiên khi ép lực mạnh
  | 'lem_muc_bot_khi'   // Lem mực / Bọt khí / Tróc men phủ / Bong màng
  | 'loi_file_khach'    // Sai file thiết kế / Nhầm tên học sinh
  | 'khac';             // Lý do khác

export interface DefectLog {
  id: string;
  orderId?: string;
  orderCode?: string;
  productId: string;
  productName: string;
  sku: string;
  quantityScrapped: number;
  reason: DefectReason;
  customReasonNote?: string;
  technicianName: string;
  estimatedCostLoss: number; // Chi phí hao hụt phôi (xưởng chịu)
  timestamp: string;
  deductedStock: boolean;
  notes?: string;
}

