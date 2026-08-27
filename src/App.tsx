import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { QuoteCalculatorView } from './components/QuoteCalculatorView';
import { ProductsView } from './components/ProductsView';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { MachinesView } from './components/MachinesView';
import { TailAdminGuideView } from './components/TailAdminGuideView';
import { JobTicketModal } from './components/JobTicketModal';
import { DeliveryReceiptModal } from './components/DeliveryReceiptModal';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { NewOrderModal } from './components/NewOrderModal';
import { DefectScrapModal } from './components/DefectScrapModal';
import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_MACHINES,
  INITIAL_CUSTOMERS,
  INITIAL_MATERIALS,
  INITIAL_DEFECT_LOGS,
} from './data/mockData';
import { Order, GiftProduct, MaterialInventory, OrderStatus, PaymentStatus, DefectLog, DefectReason } from './types';
import { deductBOMFromInventory } from './utils/bomCalculator';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'warning' } | null>(null);

  // Core Data state
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<GiftProduct[]>(INITIAL_PRODUCTS);
  const [materials, setMaterials] = useState<MaterialInventory[]>(INITIAL_MATERIALS);
  const [defectLogs, setDefectLogs] = useState<DefectLog[]>(INITIAL_DEFECT_LOGS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [machines, setMachines] = useState(INITIAL_MACHINES);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [jobTicketOrder, setJobTicketOrder] = useState<Order | null>(null);
  const [deliveryReceiptOrder, setDeliveryReceiptOrder] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [quotePrefillData, setQuotePrefillData] = useState<any>(null);

  // Defect Modal state
  const [isDefectModalOpen, setIsDefectModalOpen] = useState<boolean>(false);
  const [defectTargetOrder, setDefectTargetOrder] = useState<Order | null>(null);
  const [defectTargetSku, setDefectTargetSku] = useState<string | undefined>(undefined);

  // Sync Dark mode with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handler: Add new order with automatic BOM deduction
  const handleSaveNewOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Tự động trừ định mức vật tư phụ trợ (Giấy, decal, màng cán, mực) & phôi sản phẩm
    const { updatedProducts, updatedMaterials } = deductBOMFromInventory(
      newOrder,
      products,
      materials
    );
    setProducts(updatedProducts);
    setMaterials(updatedMaterials);

    setToastMessage({
      title: 'Tạo đơn hàng thành công!',
      desc: `Đã tự động trừ phôi & định mức vật tư tiêu hao cho đơn ${newOrder.orderCode}.`,
      type: 'success',
    });
  };

  // Handler: Manual BOM deduction trigger from Order Details Modal
  const handleDeductBOM = (order: Order) => {
    const { updatedProducts, updatedMaterials } = deductBOMFromInventory(
      order,
      products,
      materials
    );
    setProducts(updatedProducts);
    setMaterials(updatedMaterials);

    setToastMessage({
      title: 'Đã xuất kho vật tư!',
      desc: `Đã trừ định mức vật tư theo BOM cho đơn ${order.orderCode}.`,
      type: 'success',
    });
  };

  // Handler: Open Defect / Scrap Modal
  const handleOpenDefectModal = (orderId?: string, productSku?: string) => {
    if (orderId) {
      const target = orders.find((o) => o.id === orderId) || null;
      setDefectTargetOrder(target);
    } else {
      setDefectTargetOrder(null);
    }
    setDefectTargetSku(productSku);
    setIsDefectModalOpen(true);
  };

  // Handler: Submit Defect / Spoilage
  const handleSubmitDefect = (defectData: {
    orderId?: string;
    orderCode?: string;
    productId: string;
    productName: string;
    sku: string;
    quantityScrapped: number;
    reason: DefectReason;
    customReasonNote?: string;
    technicianName: string;
    estimatedCostLoss: number;
    deductConsumables: boolean;
  }) => {
    // 1. Decrement product blank stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === defectData.productId
          ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - defectData.quantityScrapped) }
          : p
      )
    );

    // 2. If deduct consumables, deduct ~1 A4 paper & ink per scrapped item
    if (defectData.deductConsumables) {
      setMaterials((prev) =>
        prev.map((m) => {
          if (m.category === 'giay_in_nhiet' || m.category === 'giay_anh_decal') {
            return { ...m, quantity: Math.max(0, m.quantity - defectData.quantityScrapped) };
          }
          return m;
        })
      );
    }

    // 3. Append to defectLogs
    const newLog: DefectLog = {
      id: `defect-${Date.now()}`,
      orderId: defectData.orderId,
      orderCode: defectData.orderCode,
      productId: defectData.productId,
      productName: defectData.productName,
      sku: defectData.sku,
      quantityScrapped: defectData.quantityScrapped,
      reason: defectData.reason,
      customReasonNote: defectData.customReasonNote,
      technicianName: defectData.technicianName,
      estimatedCostLoss: defectData.estimatedCostLoss,
      timestamp: new Date().toISOString(),
      deductedStock: true,
    };

    setDefectLogs((prev) => [newLog, ...prev]);

    // 4. Show reassurance Toast
    setToastMessage({
      title: `Báo in lại thành công: -${defectData.quantityScrapped} ${defectData.productName}`,
      desc: `Đã tự động trừ phôi kho. Tiền thu của khách hàng ${defectData.orderCode ? `đơn ${defectData.orderCode}` : ''} giữ nguyên 100%.`,
      type: 'warning',
    });
  };

  // Handler: Update order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Handler: Update order payment status
  const handleUpdatePaymentStatus = (orderId: string, newPayment: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPayment } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: newPayment } : null));
    }
  };

  // Handler: Create order directly from Pricing Calculator
  const handleCreateOrderFromQuote = (quoteData: any) => {
    setQuotePrefillData(quoteData);
    setIsNewOrderModalOpen(true);
  };

  // Handler: Add product
  const handleAddProduct = (newProd: GiftProduct) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  // Handler: Update product stock
  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQuantity: newStock } : p))
    );
  };

  // Handler: Increment/Decrement product stock by delta
  const handleUpdateProductStockDelta = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stockQuantity: Math.max(0, p.stockQuantity + delta) } : p
      )
    );
  };

  // Handler: Add material
  const handleAddMaterial = (newMat: MaterialInventory) => {
    setMaterials((prev) => [newMat, ...prev]);
  };

  // Handler: Adjust material quantity
  const handleUpdateMaterialQuantity = (matId: string, delta: number) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === matId ? { ...m, quantity: Math.max(0, m.quantity + delta) } : m
      )
    );
  };

  const pendingOrdersCount = orders.filter(
    (o) => o.status !== 'hoan_tat' && o.status !== 'huy_don'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-md shadow-2xl">
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/90 border-emerald-700 text-white'
                : 'bg-amber-900/90 border-amber-700 text-white'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-xs">{toastMessage.title}</p>
              <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* TailAdmin Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Top Navbar Header */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenNewOrder={() => {
            setQuotePrefillData(null);
            setIsNewOrderModalOpen(true);
          }}
          onOpenQuickQuote={() => setActiveTab('quote_calculator')}
          orders={orders}
          onSelectOrder={(ord) => setSelectedOrder(ord)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* View Router */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              products={products}
              machines={machines}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenNewOrder={() => {
                setQuotePrefillData(null);
                setIsNewOrderModalOpen(true);
              }}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenNewOrder={() => {
                setQuotePrefillData(null);
                setIsNewOrderModalOpen(true);
              }}
              onPrintJobTicket={(ord) => setJobTicketOrder(ord)}
              onPrintDeliveryReceipt={(ord) => setDeliveryReceiptOrder(ord)}
            />
          )}

          {activeTab === 'quote_calculator' && (
            <QuoteCalculatorView
              products={products}
              onCreateOrderFromQuote={handleCreateOrderFromQuote}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              materials={materials}
              defectLogs={defectLogs}
              orders={orders}
              onUpdateProductStock={handleUpdateProductStockDelta}
              onUpdateMaterialQuantity={handleUpdateMaterialQuantity}
              onOpenDefectModal={handleOpenDefectModal}
              onAddMaterial={handleAddMaterial}
              onAddProduct={handleAddProduct}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView customers={customers} />
          )}

          {activeTab === 'machines' && (
            <MachinesView machines={machines} />
          )}

          {activeTab === 'tailadmin_guide' && (
            <TailAdminGuideView />
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. View & Edit Order Details */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          defectLogs={defectLogs}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onUpdatePayment={handleUpdatePaymentStatus}
          onOpenJobTicket={(ord) => {
            setSelectedOrder(null);
            setJobTicketOrder(ord);
          }}
          onOpenDeliveryReceipt={(ord) => {
            setSelectedOrder(null);
            setDeliveryReceiptOrder(ord);
          }}
          onDeductBOM={handleDeductBOM}
          onOpenDefectModal={handleOpenDefectModal}
        />
      )}

      {/* 2. Workshop Job Production Ticket (Printable A4) */}
      {jobTicketOrder && (
        <JobTicketModal
          order={jobTicketOrder}
          onClose={() => setJobTicketOrder(null)}
        />
      )}

      {/* 3. Delivery Receipt / Sales Invoice (Printable A6 / A7 / K80 / A5) */}
      {deliveryReceiptOrder && (
        <DeliveryReceiptModal
          order={deliveryReceiptOrder}
          onClose={() => setDeliveryReceiptOrder(null)}
        />
      )}

      {/* 3. New Order Creation Modal */}
      {isNewOrderModalOpen && (
        <NewOrderModal
          products={products}
          onClose={() => {
            setIsNewOrderModalOpen(false);
            setQuotePrefillData(null);
          }}
          onSaveOrder={handleSaveNewOrder}
          initialQuoteData={quotePrefillData}
        />
      )}

      {/* 4. Defect / Spoilage / Reprint Modal */}
      {isDefectModalOpen && (
        <DefectScrapModal
          order={defectTargetOrder}
          orders={orders}
          products={products}
          preselectedProductSku={defectTargetSku}
          onClose={() => {
            setIsDefectModalOpen(false);
            setDefectTargetOrder(null);
            setDefectTargetSku(undefined);
          }}
          onSubmitDefect={handleSubmitDefect}
        />
      )}
    </div>
  );
}

