'use client';

import { useSearchParams } from 'next/navigation';
import { PromocodeDialogClient } from './PromocodeDialog.client';

interface PromocodeDialogWrapperProps {
  dialogType?: string;
}

/**
 * Client-side wrapper that reads promocode_id from URL parameters
 * and renders the promocode dialog.
 * 
 * This thin wrapper could potentially be merged into PromocodeDialog.client.tsx,
 * but is kept separate for clarity and single responsibility.
 * It allows the dialog to be triggered by URL parameter changes from anywhere
 * in the application (e.g., when users click promocode buttons).
 */
export function PromocodeDialogWrapper({ dialogType = 'default' }: PromocodeDialogWrapperProps) {
  const searchParams = useSearchParams();
  const promocodeId = searchParams.get('promocode_id');
  
  if (!promocodeId) return null;
  
  // Client component handles its own data fetching
  return <PromocodeDialogClient dialogType={dialogType} />;
}