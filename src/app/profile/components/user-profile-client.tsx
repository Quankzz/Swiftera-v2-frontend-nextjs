'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfileForm } from './user-profile-form';
import { UserEmailForm } from './user-email-form';
import { UserPasswordForm } from './user-password-form';

// Mock profile — replace with real API call when ready
const MOCK_PROFILE = {
  email: 'admin@swiftera.com',
  fullName: 'Quản trị viên',
  phoneNumber: '0123456789',
  avatarUrl: null as string | null,
  isVerified: false, // set true to hide warning badge
};

const tabVariants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

export function UserProfileClient() {
  const [activeTab, setActiveTab] = useState('profile');

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
          <TabsList className='grid w-full grid-cols-3 mb-8 bg-white dark:bg-[#1a1a1f] p-1 rounded-xl shadow-sm dark:shadow-black/30'>
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
                    userEmail={MOCK_PROFILE.email}
                    userName={MOCK_PROFILE.fullName}
                    phoneNumber={MOCK_PROFILE.phoneNumber}
                    avatarUrl={MOCK_PROFILE.avatarUrl}
                    isVerified={MOCK_PROFILE.isVerified}
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
                  <UserEmailForm email={MOCK_PROFILE.email} />
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
