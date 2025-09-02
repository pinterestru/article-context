// Promocode feature type definitions

export interface PromocodeData {
  id: string;
  title: string;
  code?: string; // Optional for "Go to offer" type
  description?: string;
  targetUrl?: string;
  storeName?: string;
  storeImage?: string;
  slug?: string;
}
