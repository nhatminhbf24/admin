import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Award,
  Calendar,
  ExternalLink,
  X,
  UserCheck,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { Customer } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomer?: (customer: Customer) => void;
  onAddCustomer?: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers = [],
  onSelectCustomer,
  onAddCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<Customer['type']>('ca_nhan');
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [debtAmount, setDebtAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const filtered = (customers || []).filter((c) => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      company: company.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || `${phone.trim()}@giftprint.vn`,
      address: address.trim() || 'Hà Nội, Việt Nam',
      type: customerType,
      totalOrders: 0,
      totalSpent: 0,
      discountRate: Number(discountRate) || 0,
      debtAmount: Number(debtAmount) || 0,
      notes: notes.trim() || undefined,
    };

    if (onAddCustomer) {
      onAddCustomer(newCust);
    }

    // Reset and close
    setIsAddCustomerModalOpen(false);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCustomerType('ca_nhan');
    setDiscountRate(0);
    setDebtAmount(0);
    setNotes('');
  };

  const totalDebt = customers.reduce((sum, c) => sum + (c.debtAmount || 0), 0);
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const b2bCount = customers.filter((c) => c.type === 'b2b_doanh_nghiep' || c.type === 'dai_ly_qua_tang').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" /> Khách Hàng Doanh Nghiệp & Đối Tác In Ấn
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý dữ liệu khách hàng B2B, trường học, đại lý quà tặng, tỷ lệ chiết khấu và công nợ.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-500/20 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Thêm Khách Hàng Mới
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Khách Hàng</p>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatNumber(customers.length)} <span className="text-xs font-normal text-slate-500">đối tác</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Đối Tác B2B & Đại Lý</p>
            <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center text-pink-500">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-1">
            {b2bCount} <span className="text-xs font-normal text-slate-500">doanh nghiệp</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Doanh Số Tích Lũy</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Công Nợ Khách</p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalDebt)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên khách hàng, công ty, trường học, số điện thoại, email..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500 font-medium"
        >
          <option value="all">Tất cả phân loại đối tác</option>
          <option value="ca_nhan">👤 Khách Lẻ / Cá Nhân</option>
          <option value="truong_hoc">🏫 Trường Học / Lớp Học / Đoàn Thể</option>
          <option value="dai_ly_qua_tang">🎁 Đại Lý Quà Tặng & Shop Phụ Kiện</option>
          <option value="b2b_doanh_nghiep">🏢 Doanh Nghiệp B2B & Công Ty</option>
        </select>
      </div>

      {/* Grid of Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cust) => {
          return (
            <div
              key={cust.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-rose-200 dark:hover:border-rose-900/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {cust.name}
                    </h3>
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" /> {cust.company || 'Khách lẻ / Cá nhân'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cust.type === 'b2b_doanh_nghiep'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : cust.type === 'dai_ly_qua_tang'
                      ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {cust.discountRate > 0 ? `Chiết khấu ${cust.discountRate}%` : 'Giá chuẩn'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> <span className="font-medium text-slate-800 dark:text-slate-200">{cust.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {cust.email}
                  </p>
                  <p className="flex items-start gap-2 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /> {cust.address}
                  </p>
                </div>

                {cust.notes && (
                  <div className="mt-3 p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-[11px] text-slate-600 dark:text-slate-300 italic">
                    "{cust.notes}"
                  </div>
                )}
              </div>

              {/* Footer metrics */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tổng Đặt In</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(cust.totalSpent)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Công Nợ Hiện Tại</span>
                  <p className={`font-bold ${cust.debtAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {formatCurrency(cust.debtAmount)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm Khách Hàng Mới Bằng Tay */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thêm Khách Hàng / Doanh Nghiệp Mới</h3>
                  <p className="text-[11px] text-slate-400">Lưu thông tin đối tác quà tặng, trường học, đại lý in ấn</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Họ Tên Khách Hàng / Người Đại Diện <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Nguyễn Nhật Minh"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Doanh Nghiệp / Trường Học / Shop
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="VD: THPT Marie Curie / Gift Shop Moon"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Điện Thoại Zalo / Liên Hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0988 123 456"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Gửi Báo Giá & Mockup
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: khachhang@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Địa Chỉ Nhận Hàng / Giao Ship
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VD: Số 45, Đường Lê Duẩn, Quận Hoàn Kiếm, Hà Nội"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phân Loại Đối Tác
                  </label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="ca_nhan">👤 Khách Lẻ / Cá Nhân</option>
                    <option value="truong_hoc">🏫 Trường Học / Lớp Học</option>
                    <option value="dai_ly_qua_tang">🎁 Đại Lý Quà Tặng</option>
                    <option value="b2b_doanh_nghiep">🏢 Doanh Nghiệp B2B</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tỷ Lệ Chiết Khấu (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Công Nợ Ban Đầu (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Đặc Biệt / Yêu Cầu Đóng Gói
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Thường đặt số lượng lớn mùa bế giảng, yêu cầu đóng hộp xi đỏ..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Lưu Khách Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

