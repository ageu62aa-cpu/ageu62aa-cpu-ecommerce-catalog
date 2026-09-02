// @ts-nocheck
import React from 'react';

export default function CartModal(props: any) {
  // Se o modal estiver fechado, não renderiza nada
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">Seu Carrinho</h2>

        {/* Lista de itens simples */}
        {(!props.cart || props.cart.length === 0) ? (
          <p className="text-gray-500 text-center py-8">Seu carrinho está vazio.</p>
        ) : (
          <div className="space-y-4">
            {props.cart.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-semibold">{item.name || item.title}</p>
                  <p className="text-sm text-gray-500">Qtd: {item.quantity || 1}</p>
                </div>
                <p className="font-bold">
                  R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="pt-4 border-t flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {(props.totalCart || 0).toFixed(2)}</span>
            </div>

            <button
              onClick={() => alert('Finalizando compra...')}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}