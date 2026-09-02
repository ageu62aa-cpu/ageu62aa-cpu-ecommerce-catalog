import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="group relative bg-white rounded-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col h-full p-4">
      <button 
        aria-label="Adicionar aos favoritos"
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
      >
        <Heart size={18} />
      </button>

      <div className="relative w-full h-48 mb-3 flex items-center justify-center overflow-hidden bg-white">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex flex-col flex-grow justify-between">
        <div>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-normal text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.discountPercentage && (
              <span className="text-xs font-semibold text-emerald-600">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600 mt-0.5">
            em {product.installments.quantity}x {formatCurrency(product.installments.amount)}
          </p>

          {product.freeShipping && (
            <p className="text-xs font-bold text-emerald-600 mt-1">
              Frete grátis
            </p>
          )}

          <h3 className="text-sm text-gray-700 mt-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-4 w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-medium text-sm py-2 px-4 rounded-sm transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          Adicionar
        </button>
      </div>
    </div>
  );
}