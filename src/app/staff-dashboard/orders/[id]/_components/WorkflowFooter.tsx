'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function WorkflowFooter({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <div className="bg-card overflow-hidden transition-all duration-300">
      {children}
    </div>
  );

  if (!mounted) return null;

  const target = document.getElementById('workflow-footer-portal');
  if (target) {
    return createPortal(content, target);
  }

  // Fallback if portal container not found
  return content;
}
