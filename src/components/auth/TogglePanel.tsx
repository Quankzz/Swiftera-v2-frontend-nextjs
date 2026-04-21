import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TogglePanelProps = {
  isActive: boolean;
  onSignIn: () => void;
  onSignUp: () => void;
};

export function TogglePanel({ isActive, onSignIn, onSignUp }: TogglePanelProps) {
  return (
    <div
      className={cn(
        'absolute top-0 left-1/2 z-1000 h-full w-1/2 overflow-hidden transition-all duration-600 ease-in-out',
        isActive
          ? '-translate-x-full rounded-[0_150px_100px_0]'
          : 'rounded-[150px_0_0_100px]'
      )}
    >
      <div
        className={cn(
          'relative -left-full h-full w-[200%] bg-linear-to-r from-[var(--theme-primary-start,#0ea5e9)] to-[var(--theme-primary-end,#0369a1)] text-white transition-all duration-600 ease-in-out dark:from-[var(--theme-accent-start,#38bdf8)] dark:to-[var(--theme-primary-start,#0ea5e9)]',
          isActive && 'translate-x-1/2'
        )}
      >
        {/* "Chào mừng trở lại" panel */}
        <div
          className={cn(
            'absolute top-0 flex h-full w-1/2 flex-col items-center justify-center px-8 text-center transition-all duration-600 ease-in-out',
            isActive ? 'translate-x-0' : '-translate-x-[200%]'
          )}
        >
          <h1 className="text-2xl font-bold">Chào mừng trở lại!</h1>
          <p className="my-5 text-sm leading-5 tracking-wide">
            Nhập thông tin cá nhân để sử dụng tất cả tính năng
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onSignIn}
            className="h-auto border-white bg-transparent px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white"
          >
            Đăng nhập
          </Button>
        </div>

        {/* "Xin chào" panel */}
        <div
          className={cn(
            'absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-8 text-center transition-all duration-600 ease-in-out',
            isActive && 'translate-x-[200%]'
          )}
        >
          <h1 className="text-2xl font-bold">Xin chào!</h1>
          <p className="my-5 text-sm leading-5 tracking-wide">
            Đăng ký với thông tin cá nhân để sử dụng tất cả tính năng
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onSignUp}
            className="h-auto border-white bg-transparent px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white"
          >
            Đăng ký
          </Button>
        </div>
      </div>
    </div>
  );
}
