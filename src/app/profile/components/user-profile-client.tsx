'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { userApi, type UserSecure } from '@/api/userProfileApi';
import { getApiErrorMessage } from '../utils';
import { UserProfileForm } from './user-profile-form';
import { UserEmailForm } from './user-email-form';
import { UserPasswordForm } from './user-password-form';

const tabVariants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

function ProfileSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-12 w-full rounded-xl' />
      <Skeleton className='h-64 w-full rounded-xl' />
    </div>
  );
}

export function UserProfileClient() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserSecure | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await userApi.getUserById(user.id);
      setProfile(res.data.data);
      setLoadError(null);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Không tải được hồ sơ'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      setProfile(null);
      setLoadError(null);
      return;
    }
    void loadProfile();
  }, [authLoading, isAuthenticated, user?.id, loadProfile]);

  if (authLoading) {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className='rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/10 px-6 py-8 text-center space-y-4'>
        <p className='text-text-main font-medium'>
          Bạn cần đăng nhập để xem trang cá nhân.
        </p>
        <Link
          href='/auth/login'
          className={cn(
            buttonVariants(),
            'bg-theme-primary-start hover:opacity-90 text-white',
          )}
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading && !profile) {
    return <ProfileSkeleton />;
  }

  if (loadError && !profile) {
    return (
      <div className='rounded-xl border border-red-200 dark:border-red-500/25 bg-red-50/80 dark:bg-red-500/10 px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-red-800 dark:text-red-300'>
        <AlertCircle className='h-5 w-5 shrink-0' />
        <div className='flex-1 space-y-1'>
          <p className='font-medium'>Không tải được dữ liệu</p>
          <p className='opacity-90'>{loadError}</p>
        </div>
        <Button
          type='button'
          variant='outline'
          onClick={() => void loadProfile()}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key='profile-client'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loadError && (
          <div className='mb-4 rounded-lg border border-amber-200 dark:border-amber-500/25 bg-amber-50/80 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2'>
            <AlertCircle className='h-4 w-4 shrink-0 mt-0.5' />
            <span>{loadError}</span>
          </div>
        )}

        <Tabs
          defaultValue='profile'
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-3 mb-8 bg-white dark:bg-surface-card p-1 rounded-xl shadow-sm dark:shadow-black/30'>
            <TabsTrigger
              value='profile'
              className='flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg py-2'
            >
              <User className='h-4 w-4' />
              <span>Thông tin cá nhân</span>
            </TabsTrigger>
            <TabsTrigger
              value='email'
              className='flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg py-2'
            >
              <Mail className='h-4 w-4' />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger
              value='password'
              className='flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg py-2'
            >
              <Lock className='h-4 w-4' />
              <span>Mật khẩu</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='profile'>
            <AnimatePresence mode='wait'>
              {activeTab === 'profile' && (
                <motion.div
                  key='profile'
                  {...tabVariants}
                  transition={{ duration: 0.25 }}
                >
                  <UserProfileForm
                    profile={profile}
                    onUpdated={(next) => setProfile(next)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value='email'>
            <AnimatePresence mode='wait'>
              {activeTab === 'email' && (
                <motion.div
                  key='email'
                  {...tabVariants}
                  transition={{ duration: 0.25 }}
                >
                  <UserEmailForm email={profile.email} />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value='password'>
            <AnimatePresence mode='wait'>
              {activeTab === 'password' && (
                <motion.div
                  key='password'
                  {...tabVariants}
                  transition={{ duration: 0.25 }}
                >
                  <UserPasswordForm />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AnimatePresence>
  );
}