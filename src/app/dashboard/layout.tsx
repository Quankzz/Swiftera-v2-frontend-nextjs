import { DashboardSidebar } from '@/components/dashboard/layout/sidebar';
import { DashboardHeader } from '@/components/dashboard/layout/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen w-full bg-gray-50/30 dark:bg-[#0f0f11] overflow-hidden text-text-main'>
      <DashboardSidebar />
      <div className='flex flex-1 flex-col min-w-0 overflow-hidden'>
        <DashboardHeader />
        <main className='flex-1 overflow-y-auto'>
          <div className='min-h-full'>{children}</div>
        </main>
      </div>
    </div>
  );
}
