'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfileForm } from './user-profile-form';
import { UserEmailForm } from './user-email-form';
import { UserPasswordForm } from './user-password-form';
import { useMyProfileQuery } from '@/features/users/hooks/use-user-profile';

const tabVariants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

export function UserProfileClient() {
  const [activeTab, setActiveTab] = useState('profile');
  const { data: profile, isLoading, isError } = useMyProfileQuery();

  if (isLoading) {
    return (
      <div className='h-64 flex items-center justify-center text-gray-400 text-sm'>
        Đang tải thông tin cá nhân...
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className='h-64 flex items-center justify-center text-red-400 text-sm'>
        Không thể tải thông tin cá nhân. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key='profile-client'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
                  <UserProfileForm profile={profile} />
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
