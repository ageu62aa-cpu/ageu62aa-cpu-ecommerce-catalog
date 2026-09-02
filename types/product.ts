export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
  // Propriedades opcionais para compatibilidade com o ProductCard e Melhor Envio
  title?: string;
  thumbnail?: string;
  originalPrice?: number;
  discountPercentage?: number;
  installments?: string;
  freeShipping?: boolean;
  width?: number;
  height?: number;
  length?: number;
  weight?: number;
}

export interface CartItem extends Product {
  quantity: number;
}