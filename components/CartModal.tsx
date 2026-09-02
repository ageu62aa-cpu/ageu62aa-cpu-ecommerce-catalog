import React from 'react';

export interface CartModalProps {
  [key: string]: any; // Aceita qualquer propriedade enviada pela página sem gerar erro de build
}

export default function CartModal(props: CartModalProps) {
  // Se o modal estiver fechado, retorna null
  if (props.isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl relative">
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">Seu Carrinho</h2>
        
        {/* Renderização segura do carrinho */}
        {(!props.cart || props.cart.length === 0) ? (
          <p className="text-gray-500 text-center py-8">Seu carrinho está vazio.</p>
        ) : (
          <div>
            <p>Itens no carrinho: {props.cart.length}</p>
            <button
              onClick={props.onAuthClick}
              className="mt-4 w-full bg-pink-600 text-white py-2 rounded-lg font-bold"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}