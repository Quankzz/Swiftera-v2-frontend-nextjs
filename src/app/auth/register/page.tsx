'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // TODO: Gọi API đăng ký
      router.push('/auth/login');
    } catch {
      setError('Đăng ký thất bại');
    }
  };

  return (
    <Layout>
      <div className='mx-auto max-w-md px-6 py-16 sm:px-12'>
        <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>
          Đăng ký
        </h1>
        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <Input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className='text-sm text-red-500'>{error}</p>}
          <Button type='submit'>Đăng ký</Button>
        </form>
      </div>
    </Layout>
  );
}
