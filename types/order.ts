import { CartItem } from './product';

export type PaymentMethod = 'pix' | 'card_on_delivery' | 'cash_on_delivery';

export interface CustomerData {
  name: string;
  phone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    complement?: string;
  };
  paymentMethod: PaymentMethod;
  changeFor?: string;
  notes?: string;
}

export interface OrderPayload {
  tenant_id: string;
  customer: CustomerData;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
}