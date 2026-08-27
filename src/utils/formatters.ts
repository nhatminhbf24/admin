import { OrderStatus, PriorityLevel, PaymentStatus, PrintTechnique } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const getOrderStatusInfo = (status: OrderStatus) => {
  switch (status) {
    case 'tiep_nhan':
      return {
        label: 'Tiếp nhận & Báo giá',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
        stepIndex: 0,
      };
    case 'duyet_mockup':
      return {
        label: 'Chờ duyệt Mockup',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
        stepIndex: 1,
      };
    case 'che_ban':
      return {
        label: 'Chế bản / Set máy',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        dot: 'bg-purple-500',
        stepIndex: 2,
      };
    case 'dang_in':
      return {
        label: 'Đang in ấn / Khắc',
        bg: 'bg-indigo-50 dark:bg-indigo-950/40',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800',
        dot: 'bg-indigo-500',
        stepIndex: 3,
      };
    case 'gia_cong':
      return {
        label: 'Gia công & QC',
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        dot: 'bg-orange-500',
        stepIndex: 4,
      };
    case 'hoan_tat':
      return {
        label: 'Đã hoàn tất / Giao',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        stepIndex: 5,
      };
    case 'huy_don':
      return {
        label: 'Đã hủy',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
        stepIndex: -1,
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-50 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
        stepIndex: 0,
      };
  }
};

export const getPriorityInfo = (priority: PriorityLevel) => {
  switch (priority) {
    case 'hoa_toc':
      return {
        label: 'HỎA TỐC 24H',
        bg: 'bg-rose-100 dark:bg-rose-900/40',
        text: 'text-rose-700 dark:text-rose-300',
        badge: 'border-rose-300 text-rose-800 dark:text-rose-200',
      };
    case 'gap':
      return {
        label: 'Gấp',
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        text: 'text-amber-700 dark:text-amber-300',
        badge: 'border-amber-300 text-amber-800 dark:text-amber-200',
      };
    case 'binh_thuong':
    default:
      return {
        label: 'Bình thường',
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        badge: 'border-slate-200 text-slate-700 dark:text-slate-300',
      };
  }
};

export const getPaymentStatusInfo = (status: PaymentStatus) => {
  switch (status) {
    case 'da_tat_toan':
      return {
        label: 'Đã tất toán 100%',
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      };
    case 'da_coc_50':
      return {
        label: 'Đã cọc 50%',
        bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
      };
    case 'chua_coc':
      return {
        label: 'Chưa đặt cọc',
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
      };
    case 'cong_no':
      return {
        label: 'Công nợ B2B',
        bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      };
  }
};
