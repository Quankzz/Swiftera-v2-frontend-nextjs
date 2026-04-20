'use client';

import { Toaster } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4500}
      expand={false}
      visibleToasts={5}
    />
  );
}
