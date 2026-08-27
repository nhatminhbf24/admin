import { Order, OrderItem, MaterialInventory, GiftProduct } from '../types';

export interface BOMItemConsumption {
  materialSku: string;
  materialName: string;
  unit: string;
  quantityConsumed: number;
  note: string;
}

export interface OrderBOMReport {
  orderId: string;
  orderCode: string;
  items: {
    productSku: string;
    productName: string;
    quantity: number;
    consumptions: BOMItemConsumption[];
  }[];
  totalConsumptions: {
    materialSku: string;
    materialName: string;
    unit: string;
    totalQuantity: number;
  }[];
}

/**
 * Tính toán định mức tiêu hao vật tư (BOM) dựa trên quy cách sản phẩm & số lượng
 */
export function calculateOrderBOM(order: Order): OrderBOMReport {
  const itemReports = order.items.map((item) => {
    const consumptions: BOMItemConsumption[] = [];
    const qty = item.quantity;

    if (item.serviceGroup === 'chuyen_nhiet') {
      // 1. Phôi sản phẩm
      consumptions.push({
        materialSku: item.sku,
        materialName: `Phôi ${item.productName}`,
        unit: item.category === 'in_nhan_vo' ? 'Set' : item.category === 'anh_ky_niem' ? 'Tấm' : 'Chiếc',
        quantityConsumed: qty,
        note: 'Trừ phôi chính trong kho sản phẩm',
      });

      // 2. Giấy in chuyển nhiệt Sublimation A4
      let paperSheets = 0;
      if (item.category === 'ly_su') {
        // 1 tờ A4 in được 3 dải in quanh thân ly
        paperSheets = Math.ceil(qty / 3);
        consumptions.push({
          materialSku: 'GIAY-SUB-A4',
          materialName: 'Giấy in chuyển nhiệt Sublimation A4 Hàn Quốc',
          unit: 'Tờ (A4)',
          quantityConsumed: paperSheets,
          note: `Định mức 3 ly / 1 tờ A4 (Tổng: ${paperSheets} tờ)`,
        });
      } else if (item.category === 'moc_khoa') {
        // 1 tờ A4 in được 12 phôi móc khóa
        paperSheets = Math.ceil((qty * 2) / 12); // In 2 mặt
        consumptions.push({
          materialSku: 'GIAY-SUB-A4',
          materialName: 'Giấy in chuyển nhiệt Sublimation A4 Hàn Quốc',
          unit: 'Tờ (A4)',
          quantityConsumed: paperSheets,
          note: `Định mức 12 phôi / 1 tờ A4, in 2 mặt (Tổng: ${paperSheets} tờ)`,
        });
      } else if (item.category === 'huy_hieu') {
        // 1 tờ A4 in được 8-10 huy hiệu
        paperSheets = Math.ceil(qty / 8);
        consumptions.push({
          materialSku: 'GIAY-SUB-A4',
          materialName: 'Giấy in chuyển nhiệt Sublimation A4 Hàn Quốc',
          unit: 'Tờ (A4)',
          quantityConsumed: paperSheets,
          note: `Định mức 8 huy hiệu / 1 tờ A4 (Tổng: ${paperSheets} tờ)`,
        });
      } else {
        // Tranh đá, Áo thun, Đồng hồ, Túi vải: 1 tờ A4/A3 cho 1 chiếc
        paperSheets = qty;
        consumptions.push({
          materialSku: 'GIAY-SUB-A4',
          materialName: 'Giấy in chuyển nhiệt Sublimation A4 Hàn Quốc',
          unit: 'Tờ (A4)',
          quantityConsumed: paperSheets,
          note: `Định mức 1 tờ / 1 sản phẩm (Tổng: ${paperSheets} tờ)`,
        });
      }

      // 3. Mực in chuyển nhiệt Sublimation (ước tính ml)
      const inkMl = Math.round(qty * 0.8 * 10) / 10;
      consumptions.push({
        materialSku: 'MUC-SUBLI-1L',
        materialName: 'Mực in chuyển nhiệt Inktec Sublinova',
        unit: 'ml',
        quantityConsumed: inkMl,
        note: `Định mức 0.8ml mực CMYK / sản phẩm (Tổng: ${inkMl} ml)`,
      });
    } else {
      // IN ẢNH & NHÃN VỞ
      if (item.category === 'in_nhan_vo') {
        // Mỗi set nhãn vở trung bình dùng 2 tờ Decal A4
        const decalSheets = qty * 2;
        consumptions.push({
          materialSku: 'DEC-VANG-A4',
          materialName: 'Decal ảnh bóc dán đế vàng A4 chống nước',
          unit: 'Tờ (A4)',
          quantityConsumed: decalSheets,
          note: `Định mức 2 tờ Decal A4 / 1 set nhãn vở (Tổng: ${decalSheets} tờ)`,
        });

        // Màng cán Hologram hoặc màng bóng
        const holoMeters = Math.round(qty * 0.6 * 10) / 10;
        consumptions.push({
          materialSku: 'MANG-HOLO-32',
          materialName: 'Màng cán nhiệt Hologram 7 màu / Cán bóng',
          unit: 'Mét dài',
          quantityConsumed: holoMeters,
          note: `Định mức 0.6m màng cuộn / 1 set nhãn (Tổng: ${holoMeters}m)`,
        });
      } else if (item.category === 'anh_ky_niem') {
        // Ảnh Polaroid 6x9 (1 tờ A4 in 9 tấm)
        const rcSheets = Math.ceil(qty / 9);
        consumptions.push({
          materialSku: 'GIAY-RC-230',
          materialName: 'Giấy in ảnh RC Glossy bóng 230gsm A4',
          unit: 'Tờ (A4)',
          quantityConsumed: rcSheets,
          note: `Định mức 9 ảnh Polaroid / 1 tờ A4 (Tổng: ${rcSheets} tờ)`,
        });

        // Màng cán lụa / Ép plastic
        const plasticSheets = Math.ceil(qty / 9);
        consumptions.push({
          materialSku: 'PLASTIC-80M-A4',
          materialName: 'Màng ép Plastic / Cán màng bảo vệ ảnh',
          unit: 'Tờ',
          quantityConsumed: plasticSheets,
          note: `Tổng: ${plasticSheets} tờ màng bảo vệ`,
        });
      } else if (item.category === 'khung_anh') {
        // Phôi khung
        consumptions.push({
          materialSku: 'PHOI-KHUNG-1521',
          materialName: 'Phôi khung ảnh để bàn composite 15x21',
          unit: 'Chiếc',
          quantityConsumed: qty,
          note: `Tổng: ${qty} khung hoàn chỉnh`,
        });
        // Giấy in ảnh A5/A4
        const photoPaper = qty;
        consumptions.push({
          materialSku: 'GIAY-RC-230',
          materialName: 'Giấy in ảnh RC Glossy 230gsm',
          unit: 'Tờ',
          quantityConsumed: photoPaper,
          note: `1 ảnh lồng khung / 1 tờ (Tổng: ${photoPaper} tờ)`,
        });
      }
    }

    return {
      productSku: item.sku,
      productName: item.productName,
      quantity: item.quantity,
      consumptions,
    };
  });

  // Gom tổng tiêu hao toàn đơn
  const summaryMap: Record<string, { materialSku: string; materialName: string; unit: string; totalQuantity: number }> = {};

  itemReports.forEach((it) => {
    it.consumptions.forEach((c) => {
      if (!summaryMap[c.materialSku]) {
        summaryMap[c.materialSku] = {
          materialSku: c.materialSku,
          materialName: c.materialName,
          unit: c.unit,
          totalQuantity: 0,
        };
      }
      summaryMap[c.materialSku].totalQuantity += c.quantityConsumed;
    });
  });

  return {
    orderId: order.id,
    orderCode: order.orderCode,
    items: itemReports,
    totalConsumptions: Object.values(summaryMap),
  };
}

/**
 * Trừ tồn kho vật tư và phôi tự động
 */
export function deductBOMFromInventory(
  order: Order,
  products: GiftProduct[],
  materials: MaterialInventory[]
): { updatedProducts: GiftProduct[]; updatedMaterials: MaterialInventory[]; deductedSummary: string[] } {
  const bomReport = calculateOrderBOM(order);
  const deductedSummary: string[] = [];

  // Trừ sản phẩm phôi
  const updatedProducts = products.map((p) => {
    const matchedItem = order.items.find((it) => it.sku === p.sku);
    if (matchedItem) {
      const newStock = Math.max(0, p.stockQuantity - matchedItem.quantity);
      deductedSummary.push(`- ${matchedItem.quantity} ${p.unit} phôi ${p.name} (Còn lại: ${newStock})`);
      return { ...p, stockQuantity: newStock };
    }
    return p;
  });

  // Trừ kho vật tư phụ trợ (Giấy, màng, mực)
  const updatedMaterials = materials.map((m) => {
    const matchedBOM = bomReport.totalConsumptions.find((b) => b.materialSku === m.sku);
    if (matchedBOM) {
      // Nếu là tệp (1 tệp = 100 tờ hoặc 50 tờ), quy đổi tương đối
      let delta = matchedBOM.totalQuantity;
      if (m.unit.toLowerCase() === 'tệp') {
        delta = Math.max(1, Math.round(matchedBOM.totalQuantity / 50)); // quy đổi ước lượng tệp
      } else if (m.unit.toLowerCase() === 'cuộn') {
        delta = Math.max(0.1, Math.round((matchedBOM.totalQuantity / 200) * 10) / 10);
      } else if (m.unit.toLowerCase() === 'chai') {
        delta = Math.max(0.05, Math.round((matchedBOM.totalQuantity / 1000) * 100) / 100);
      }

      const newQty = Math.max(0, Math.round((m.quantity - delta) * 10) / 10);
      deductedSummary.push(`- ${matchedBOM.totalQuantity} ${matchedBOM.unit} ${m.name} (Tồn kho: ${newQty} ${m.unit})`);
      return { ...m, quantity: newQty };
    }
    return m;
  });

  return { updatedProducts, updatedMaterials, deductedSummary };
}
