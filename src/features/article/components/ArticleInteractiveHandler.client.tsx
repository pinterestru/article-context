'use client';

import { useEffect } from 'react';
import { PromocodeDialogWrapper } from '@/features/promocode/components/PromocodeDialogWrapper.client';
import { setupAnchorLinks } from '../utils/scroll';

interface ArticleInteractiveHandlerProps {
  dialogType?: string;
}

/**
 * Client component that handles interactive features for articles
 * This includes smooth scrolling for anchor links, promocode dialogs, and other client-side enhancements
 */
export function ArticleInteractiveHandler({ dialogType = 'default' }: ArticleInteractiveHandlerProps) {
  useEffect(() => {
    // Setup anchor link handling using the shared utility
    const cleanup = setupAnchorLinks(document.body);
    
    return cleanup;
  }, []);
  
  return (
    <>
      {/* Promocode Dialog - triggered by URL parameters */}
      <PromocodeDialogWrapper dialogType={dialogType} />
    </>
  );
}