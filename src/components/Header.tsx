import React, { useState } from 'react';
import {
  Search,
  Bell,
  Moon,
  Sun,
  PlusCircle,
  Calculator,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer
} from 'lucide-react';
import { Order } from '../types';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenNewOrder: () => void;
  onOpenQuickQuote: () => void;
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  onOpenNewOrder,
  onOpenQuickQuote,
  orders,
  onSelectOrder,
  searchQuery,
  setSearchQuery,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Urgent and pending approvals
  const urgentOrders = orders.filter((o) => o.priority === 'hoa_toc' || o.priority === 'gap');
  const mockupPendingOrders = orders.filter((o) => o.status === 'duyet_mockup');

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã đơn (GIFT-...), tên khách, sđt, phôi bình, cốc, bút..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
          />
        </div>
      </div>

      {/* Action Buttons & Utilities */}
      <div className="flex items-center gap-2.5">
        {/* Quick Quote Calculator */}
        <button
          onClick={onOpenQuickQuote}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          title="Mở máy tính báo giá in ấn"
        >
          <Calculator className="w-4 h-4 text-amber-500" />
          <span>Tính Báo Giá</span>
        </button>

        {/* New Order Button */}
        <button
          onClick={onOpenNewOrder}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 rounded-xl transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden xs:inline">Tạo Đơn In Mới</span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Thông báo xưởng in"
          >
            <Bell className="w-5 h-5" />
            {urgentOrders.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Thông Báo Tiến Độ Xưởng</h4>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                  {urgentOrders.length + mockupPendingOrders.length} mới
                </span>
              </div>

              <div className="py-2 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {urgentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onSelectOrder(ord);
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="font-bold text-xs text-rose-800 dark:text-rose-300">{ord.orderCode} - ĐƠN {ord.priority === 'hoa_toc' ? 'HỎA TỐC' : 'GẤP'}</span>
                      </div>
                      <span className="text-[11px] text-rose-600 font-medium">Hạn: {new Date(ord.deadline).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">{ord.customerName} ({ord.customerCompany || 'Khách lẻ'})</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ord.items[0]?.productName} ({ord.items[0]?.quantity} chiếc)</p>
                  </div>
                ))}

                {mockupPendingOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onSelectOrder(ord);
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-bold text-xs text-amber-800 dark:text-amber-300">{ord.orderCode} - Chờ khách duyệt Mockup</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{ord.customerCompany || ord.customerName}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  Đóng thông báo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/20">
              AD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">Admin Xưởng In</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Quản lý Sản Xuất</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-xs text-slate-900 dark:text-white">Xưởng In Quà Tặng GiftPrint</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">admin@giftprint.vn</p>
              </div>
              <div className="py-1">
                <div className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between items-center py-1">
                    <span>Quyền hạn:</span>
                    <span className="font-semibold text-blue-600">Super Admin</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Chi nhánh:</span>
                    <span className="font-semibold">Hà Nội Xưởng 1</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
