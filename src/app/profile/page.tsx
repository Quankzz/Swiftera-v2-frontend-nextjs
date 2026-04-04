'use client';

import { Suspense } from 'react';
import { UserCircle, Settings, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserProfileClient } from './components/user-profile-client';

export default function ProfilePage() {
  return (
    <div className='relative'>
      <div className='absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl' />
      <div className='absolute bottom-0 left-0 w-40 h-40 bg-linear-to-tr from-blue-500/10 to-primary/10 rounded-full blur-3xl' />

      <div className='relative z-10'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-primary to-primary/80 rounded-2xl shadow-lg mb-6'>
            <UserCircle className='h-10 w-10 text-white' />
          </div>
          <h1 className='text-4xl font-bold bg-linear-to-r from-gray-900 dark:from-gray-100 to-gray-600 dark:to-gray-400 bg-clip-text text-transparent mb-4'>
            Trang cá nhân
          </h1>
          <p className='text-lg text-gray-600 dark:text-text-sub max-w-2xl mx-auto'>
            Quản lý thông tin tài khoản và bảo mật của bạn
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'
        >
          <div className='bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-white/8 shadow-lg hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center space-x-3 mb-3'>
              <div className='p-2 bg-blue-100 dark:bg-blue-500/15 rounded-lg'>
                <User className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <h3 className='font-semibold text-gray-900 dark:text-text-main'>
                Thông tin cá nhân
              </h3>
            </div>
            <p className='text-sm text-gray-600 dark:text-text-sub'>
              Họ tên, biệt danh, ảnh đại diện, giới thiệu, thành phố
            </p>
          </div>

          <div className='bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-white/8 shadow-lg hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center space-x-3 mb-3'>
              <div className='p-2 bg-green-100 dark:bg-green-500/15 rounded-lg'>
                <Settings className='h-5 w-5 text-green-600 dark:text-green-400' />
              </div>
              <h3 className='font-semibold text-gray-900 dark:text-text-main'>
                Cài đặt email
              </h3>
            </div>
            <p className='text-sm text-gray-600 dark:text-text-sub'>
              Thay đổi địa chỉ email liên kết
            </p>
          </div>

          <div className='bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-white/8 shadow-lg hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center space-x-3 mb-3'>
              <div className='p-2 bg-purple-100 dark:bg-purple-500/15 rounded-lg'>
                <Shield className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <h3 className='font-semibold text-gray-900 dark:text-text-main'>
                Bảo mật
              </h3>
            </div>
            <p className='text-sm text-gray-600 dark:text-text-sub'>
              Đổi mật khẩu và bảo vệ tài khoản
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Suspense
            fallback={
              <div className='h-64 flex items-center justify-center text-gray-400 text-sm'>
                Đang tải...
              </div>
            }
          >
            <UserProfileClient />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
