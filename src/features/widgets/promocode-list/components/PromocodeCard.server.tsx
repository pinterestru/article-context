import { getSiteConfig } from '@/config/sites/static';
import type { Promocode } from '../types';
import { PromocodeCardDefault } from './promocode-cards/default/PromocodeCardDefault.server';

interface PromocodeCardProps {
  promocode: Promocode;
  className?: string;
  onClick?: () => void;
}

export async function PromocodeCard(props: PromocodeCardProps) {
  const config = getSiteConfig();
  const cardType = config.promocodeCard || 'default';
  
  // Select promocode card implementation based on config
  switch (cardType) {
    case 'default':
      return <PromocodeCardDefault {...props} />;
    default:
      // Fallback to default for unknown types
      console.warn(`Unknown promocode card type: ${cardType}, falling back to default`);
      return <PromocodeCardDefault {...props} />;
  }
}