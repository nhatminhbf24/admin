export type OrderStatus = 
  | 'tiep_nhan'      // Tiếp nhận & Báo giá
  | 'duyet_mockup'    // Chờ duyệt mockup thiết kế
  | 'che_ban'         // Đang chế bản / Xuất phim / Set máy
  | 'dang_in'         // Đang in ấn / khắc laser / ép nhiệt
  | 'gia_cong'        // Gia công, sấy, QC & Đóng gói
  | 'hoan_tat'        // Đã hoàn tất & Giao hàng
  | 'huy_don';        // Hủy đơn

export type PrintTechnique = 
  | 'laser'       // Khắc Laser kim loại/gỗ/da
  | 'uv'          // In UV phẳng kỹ thuật số
  | 'chuyen_nhiet'// In Chuyển nhiệt / Sublimation
  | 'in_luoi'     // In Lưới / Lụa (Screen Print)
  | 'dtf'         // In DTF (Direct to Film) cho vải/áo
  | 'ep_kim'      // Ép kim / Dập chìm (Foil Stamping / Embossing)
  | 'decal_nuoc'; // Dán Decal nước nung nhiệt

export type PaymentStatus = 'chua_coc' | 'da_coc_50' | 'da_tat_toan' | 'cong_no';

export type PriorityLevel = 'binh_thuong' | 'gap' | 'hoa_toc';

export interface PrintPosition {
  id: string;
  name: string; // VD: "Mặt trước", "Nắp bình", "Vòng quanh 360", "Ngực trái"
  dimensions: string; // VD: "45 x 65 mm"
  colors: string; // VD: "Full color", "1 màu Trắng Pantone 000C", "Khắc màu kim loại"
  technique: PrintTechnique;
}

export interface OrderItem {
  id: string;
  productName: string; // VD: "Bình giữ nhiệt inox Life 500ml - Đen nhám"
  sku: string;
  quantity: number;
  unitPrice: number;
  printPricePerUnit: number;
  printPositions: PrintPosition[];
  mockupUrl: string;
  proofApproved: boolean;
  notes?: string;
}

export interface Order {
  id: string;
  orderCode: string; // VD: "ORD-2026-089"
  customerName: string;
  customerPhone: string;
  customerCompany?: string;
  customerEmail?: string;
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
  category: 'binh_giu_nhiet' | 'coc_su' | 'but_ky' | 'ao_dong_phuc' | 'so_tay' | 'ky_niem_chuong' | 'tui_canvas' | 'hop_qua_vip' | 'o_du';
  sku: string;
  basePrice: number; // Giá phôi sỉ
  stockQuantity: number;
  minStockAlert: number;
  unit: string;
  imageUrl: string;
  material: string;
  colors: string[];
  compatibleTechniques: PrintTechnique[];
  description: string;
}

export interface Machine {
  id: string;
  name: string;
  code: string;
  type: PrintTechnique;
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
  type: 'b2b_doanh_nghiep' | 'dai_ly_qua_tang' | 'ca_nhan' | 'truong_hoc';
  totalOrders: number;
  totalSpent: number;
  discountRate: number; // %
  debtAmount: number;
  notes?: string;
}

export interface MaterialInventory {
  id: string;
  name: string;
  category: 'muc_in' | 'film_dtf' | 'hop_dung' | 'ruy_bang' | 'keo_tay' | 'decal';
  sku: string;
  quantity: number;
  unit: string;
  minAlert: number;
  supplier: string;
  lastImportDate: string;
}

export interface QuotePricingFormula {
  productId: string;
  quantity: number;
  technique: PrintTechnique;
  printPositionsCount: number;
  packagingOption: 'khong_hop' | 'hop_carton' | 'hop_xi_lot_lua' | 'tui_kraft';
  personalizeNamesCount: number; // Khắc tên riêng từng chiếc
  hasUrgentFee: boolean;
}
