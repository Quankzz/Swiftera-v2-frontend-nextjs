export default function DashboardIndex() {
  return (
    <div className='p-6 h-full flex flex-col items-center justify-center text-center'>
      <h1 className='text-3xl font-bold text-text-main mb-4'>
        Chào mừng đến với Swiftera Dashboard
      </h1>
      <p className='text-text-sub max-w-2xl'>
        Hệ thống quản trị đang được phát triển. Vui lòng chọn các tính năng
        Người dùng, Vai trò, hoặc Phân quyền ở thanh menu bên trái để trải
        nghiệm cấu hình UI.
      </p>
    </div>
  );
}
