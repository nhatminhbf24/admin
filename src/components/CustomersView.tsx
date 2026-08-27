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
  ExternalLink
} from 'lucide-react';
import { Customer } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomer?: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = customers.filter((c) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Khách Hàng Doanh Nghiệp & Đối Tác In Ấn
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý dữ liệu khách hàng B2B, trường học, đại lý quà tặng, tỷ lệ chiết khấu và công nợ.
          </p>
        </div>
      </div>

      {/* Grid of Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cust) => {
          return (
            <div
              key={cust.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {cust.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" /> {cust.company || 'Khách lẻ / Cá nhân'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    VIP - Giảm {cust.discountRate}%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {cust.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {cust.email}
                  </p>
                  <p className="flex items-start gap-2 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /> {cust.address}
                  </p>
                </div>

                {cust.notes && (
                  <div className="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 italic">
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
    </div>
  );
};
