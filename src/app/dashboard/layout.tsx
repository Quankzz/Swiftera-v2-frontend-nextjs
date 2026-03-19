import { DashboardSidebar } from '@/components/dashboard/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen w-full bg-gray-50/30 overflow-hidden text-text-main'>
      <DashboardSidebar />
      <main className='flex-1 overflow-y-auto'>
        <div className='min-h-full'>{children}</div>
      </main>
    </div>
  );
}
