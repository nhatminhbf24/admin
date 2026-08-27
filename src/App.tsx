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
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { NewOrderModal } from './components/NewOrderModal';
import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_MACHINES,
  INITIAL_CUSTOMERS,
  INITIAL_MATERIALS,
} from './data/mockData';
import { Order, GiftProduct, MaterialInventory, OrderStatus, PaymentStatus } from './types';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Data state
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<GiftProduct[]>(INITIAL_PRODUCTS);
  const [materials, setMaterials] = useState<MaterialInventory[]>(INITIAL_MATERIALS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [machines, setMachines] = useState(INITIAL_MACHINES);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [jobTicketOrder, setJobTicketOrder] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [quotePrefillData, setQuotePrefillData] = useState<any>(null);

  // Sync Dark mode with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handler: Add new order
  const handleSaveNewOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Deduct stock for the product
    if (newOrder.items[0]) {
      const prodSku = newOrder.items[0].sku;
      const qty = newOrder.items[0].quantity;
      setProducts((prev) =>
        prev.map((p) => (p.sku === prodSku ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - qty) } : p))
      );
    }
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
              materials={materials}
              onAddMaterial={handleAddMaterial}
              onUpdateQuantity={handleUpdateMaterialQuantity}
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
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onUpdatePayment={handleUpdatePaymentStatus}
          onOpenJobTicket={(ord) => {
            setSelectedOrder(null);
            setJobTicketOrder(ord);
          }}
        />
      )}

      {/* 2. Workshop Job Production Ticket (Printable A4) */}
      {jobTicketOrder && (
        <JobTicketModal
          order={jobTicketOrder}
          onClose={() => setJobTicketOrder(null)}
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
    </div>
  );
}
