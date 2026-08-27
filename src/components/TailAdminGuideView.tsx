import React from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Server,
  Code2,
  BookOpen,
  ArrowRight,
  Terminal,
  Cpu,
  Package,
  Printer
} from 'lucide-react';

export const TailAdminGuideView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            TailAdmin Core Documentation & Blueprint
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Hướng Dẫn Chi Tiết Về TailAdmin & Kế Hoạch Triển Khai Xưởng In Quà Tặng
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Giải đáp toàn diện về TailAdmin, các thành phần kiến trúc cốt lõi, cách tích hợp vào webapp Quản lý In Ấn Quà Tặng và quy trình deploy chuẩn Node.js hosting.
        </p>
      </div>

      {/* Section 1: TailAdmin là gì */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" /> 1. TailAdmin Free Tailwind Dashboard Template Là Gì?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>TailAdmin</strong> (nguồn: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 font-mono text-xs">TailAdmin/tailadmin-free-tailwind-dashboard-template</code>) là một bộ template bảng điều khiển quản trị (Admin Dashboard UI Kit) mã nguồn mở hàng đầu, được xây dựng hoàn toàn bằng <strong>Tailwind CSS</strong> kết hợp với các framework hiện đại như <strong>React / Next.js / Vue / HTML</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400 uppercase mb-1">Thiết Kế Chuẩn Admin</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Giao diện tối giản, phân cấp rõ ràng, hỗ trợ đầy đủ Dark Mode / Light Mode và Responsive 100% trên Mobile, Tablet, Desktop.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase mb-1">Tailwind CSS Thuần</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Dễ dàng tùy biến màu sắc thương hiệu, không bị phụ thuộc vào các thư viện UI cồng kềnh khó sửa.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs text-purple-600 dark:text-purple-400 uppercase mb-1">Bộ Thành Phần Phong Phú</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Có sẵn Sidebar đa cấp, Navbar tìm kiếm & thông báo, Thẻ KPI số liệu, Bảng dữ liệu lọc/tìm kiếm, Form nhập liệu, Biểu đồ thống kê.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Các thành phần cốt lõi của TailAdmin */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" /> 2. Các Thành Phần & Chức Năng Cốt Lõi Của TailAdmin
        </h2>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">1</div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Sidebar Navigation (Thanh Điều Hướng Bên Trái):</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chứa menu các phân hệ (Dashboard, Đơn hàng, Tính giá, Sản phẩm phôi, Vật tư mực in, Khách hàng, Máy móc), có thể thu gọn / mở rộng linh hoạt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">2</div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Header & Top Navbar:</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Thanh tìm kiếm toàn cục, nút tạo đơn nhanh, chuông thông báo tiến độ xưởng in (đơn gấp, cảnh báo hết mực/phôi), nút bật/tắt Dark Mode và Menu tài khoản người dùng.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">3</div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Metric & Stats Cards (Thẻ Thống Kê Chỉ Số):</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hiển thị doanh thu thực tế, số lượng đơn hàng in đang chạy, tỷ lệ đúng hạn giao hàng và tổng tồn kho phôi quà tặng kèm chỉ số tăng giảm %.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">4</div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Interactive Tables & Kanban Workflow (Bảng Dữ Liệu & Quy Trình In):</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bảng quản trị đơn hàng lọc theo công nghệ (Laser, UV, DTF, In Lụa, Ép Kim), mức ưu tiên (Hỏa tốc 24h, Gấp) và chế độ kéo thả Kanban 6 bước xưởng in.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Kế hoạch triển khai Quản lý In Ấn Quà Tặng */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Printer className="w-5 h-5 text-emerald-600" /> 3. Kế Hoạch Triển Khai Webapp Quản Lý In Ấn Quà Tặng (GiftPrint Pro)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Giai Đoạn 1: Cấu Trúc Giao Diện & Báo Giá
            </h4>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li>Xây dựng Dashboard TailAdmin chuẩn Responsive & Dark Mode.</li>
              <li>Tạo bộ tính giá in ấn (Pricing Calculator) tự động theo phôi + công in + chiết khấu số lượng + phụ phí khuôn in.</li>
              <li>Số hóa danh mục phôi quà tặng (Bình giữ nhiệt, Cốc sứ, Bút ký, Sổ da, Áo thun, Kỷ niệm chương pha lê).</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
            <h4 className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Giai Đoạn 2: Vận Hành Xưởng & Tiến Độ In
            </h4>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li>Quy trình sản xuất 6 bước khép kín (Tiếp nhận → Duyệt Mockup → Chế bản/Set máy → Đang in → QC/Gia công → Hoàn tất).</li>
              <li>Xuất <strong>Phiếu Lệnh Sản Xuất (Job Ticket)</strong> in xưởng chuẩn thông số vị trí, kích thước in mm, mã màu Pantone.</li>
              <li>Giám sát tình trạng và công suất đội máy in (Mimaki UV, Laser Raycus, Ép kim, DTF).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 4: Hướng dẫn Deploy lên Hosting Node.js */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-purple-600" /> 4. Hướng Dẫn Deploy Lên Node.js Hosting (Tenten / cPanel / Vibe Host)
        </h2>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-mono">
          <div className="p-3 bg-slate-950 text-slate-100 rounded-xl space-y-1">
            <p className="text-slate-400">// 1. Khởi động server với cổng động tương thích hosting:</p>
            <p className="text-emerald-400">const PORT = process.env.PORT || 3000;</p>
            <p className="text-emerald-400">app.listen(PORT, "0.0.0.0", () =&gt; console.log(`Server running on port ${'{'}PORT{'}'}`));</p>
          </div>

          <div className="p-3 bg-slate-950 text-slate-100 rounded-xl space-y-1">
            <p className="text-slate-400">// 2. Lệnh build & start trong package.json:</p>
            <p className="text-blue-400">"scripts": {'{'}</p>
            <p className="text-slate-300 ml-4">"build": "vite build",</p>
            <p className="text-slate-300 ml-4">"start": "node server.js"</p>
            <p className="text-blue-400">{'}'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
