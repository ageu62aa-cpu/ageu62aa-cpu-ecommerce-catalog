export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}
