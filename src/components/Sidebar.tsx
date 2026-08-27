import React from 'react';
import {
  LayoutDashboard,
  Printer,
  Calculator,
  Gift,
  Package,
  Users,
  Cpu,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  DollarSign,
  Archive
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'orders'
  | 'order_history'
  | 'quote_calculator'
  | 'inventory'
  | 'finance'
  | 'customers'
  | 'machines'
  | 'tailadmin_guide';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  pendingOrdersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  pendingOrdersCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
    { id: 'orders', label: 'Tiến Độ Đơn & Xưởng In', icon: Printer, badge: pendingOrdersCount, badgeColor: 'bg-rose-500 text-white' },
    { id: 'order_history', label: 'Lịch Sử & Lưu Trữ Đơn', icon: Archive, badge: 'Lưu Trữ', badgeColor: 'bg-slate-700 text-white' },
    { id: 'quote_calculator', label: 'Tính Giá & Báo Giá In', icon: Calculator, badge: 'Hot', badgeColor: 'bg-amber-500 text-white' },
    { id: 'inventory', label: 'Kho Phôi & Vật Tư', icon: Package, badge: 'Gộp', badgeColor: 'bg-rose-500 text-white' },
    { id: 'finance', label: 'Tài Chính & Báo Cáo', icon: DollarSign, badge: 'P&L', badgeColor: 'bg-emerald-500 text-white' },
    { id: 'customers', label: 'Khách Hàng & Doanh Nghiệp', icon: Users },
    { id: 'machines', label: 'Máy Móc & Thiết Bị In', icon: Cpu },
    { id: 'tailadmin_guide', label: 'Kiến Trúc TailAdmin & HDSD', icon: FileSpreadsheet, badge: 'Doc', badgeColor: 'bg-emerald-500 text-white' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-18 px-4 border-b border-slate-100 dark:border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                GiftPrint <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">PRO</span>
              </span>
              <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">Xưởng Quà Tặng & In Ấn</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Gift className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
          {!collapsed ? 'Menu Quản Lý' : '•••'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/50 dark:hover:bg-slate-800/80 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400'}`} />
              
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {!collapsed && item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-xs ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {collapsed && item.badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Workshop Status Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Xưởng Đang Hoạt Động
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">3/5 Máy in</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Tải xưởng: 78% công suất in UV & Laser.
            </p>
          </div>
        ) : (
          <button 
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
