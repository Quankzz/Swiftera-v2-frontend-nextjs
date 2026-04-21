import { DashboardSidebar } from '@/components/dashboard/layout/sidebar';
import { DashboardHeader } from '@/components/dashboard/layout/dashboard-header';
import { DashboardRoleGuard } from '@/components/auth/DashboardRoleGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleGuard allowedRoles={['ADMIN']}>
      <div className='flex h-screen w-full bg-gray-50/30 dark:bg-surface-base overflow-hidden text-text-main'>
        <DashboardSidebar />
        <div className='flex flex-1 flex-col min-w-0 overflow-hidden'>
          <DashboardHeader />
          <main className='flex-1 overflow-y-auto'>
            <div className='min-h-full'>{children}</div>
          </main>
        </div>
      </div>
    </DashboardRoleGuard>
  );
}
