import Image from 'next/image';

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
  title?: string;
  thumbnail?: string;
  originalPrice?: number;
  discountPercentage?: number;
  installments?: string | { quantity: number; amount: number };
  freeShipping?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

interface ProductCardProps {
  product: CartItem;
  onAddToCart?: (product: CartItem) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const title = product.title || product.name || 'Produto Lucymake';
  const imageUrl = product.thumbnail || product.image_url || '/placeholder.png';
  const price = product.price || 0;
  const originalPrice = product.originalPrice || price * 1.2;
  const discountPercentage = product.discountPercentage || 20;
  const freeShipping = product.freeShipping ?? true;

  const installmentsText = typeof product.installments === 'object' && product.installments !== null
    ? `${(product.installments as any).quantity || 3}x de R$ ${(product.installments as any).amount || (price / 3).toFixed(2)}`
    : (product.installments || `3x de R$ ${(price / 3).toFixed(2)}`);

  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col justify-between bg-white">
      <div>
        <div className="relative w-full h-48 mb-3 bg-gray-100 rounded-md overflow-hidden">
          <Image 
            src={imageUrl} 
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <h3 className="font-semibold text-gray-800 text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description || ''}</p>
      </div>

      <div>
        <div className="mb-2">
          {originalPrice > price && (
            <span className="text-xs text-gray-400 line-through mr-2">
              R$ {originalPrice.toFixed(2)}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-medium">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        <div className="text-xl font-bold text-gray-900 mb-1">
          R$ {price.toFixed(2)}
        </div>

        <div className="text-xs text-gray-500 mb-3">
          ou {installmentsText}
        </div>

        {freeShipping && (
          <div className="text-xs text-green-600 font-medium mb-3">
            Frete Grátis
          </div>
        )}

        <button
          onClick={() => onAddToCart && onAddToCart({ ...product, quantity: product.quantity || 1 })}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}