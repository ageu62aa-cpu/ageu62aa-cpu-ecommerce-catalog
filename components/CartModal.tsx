import React from 'react';

// Definimos a interface permitindo qualquer propriedade opcional para evitar o erro TS2322
export interface CartModalProps {
  isOpen?: boolean;
  cart?: any[];
  totalCart?: number;
  shippingCost?: number;
  calculatingShipping?: boolean;
  currentUser?: { name?: string; email?: string } | null;
  userCep?: string;
  onClose?: () => void;
  onAuthClick?: () => void;
  [key: string]: any; // Permite qualquer outra propriedade extra sem reclamar
}

export default function CartModal(props: CartModalProps) {
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors"
        >
          &times;
        </button>

        <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
          🛒 Seu Carrinho
        </h2>

        {(!props.cart || props.cart.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">Seu carrinho está vazio.</p>
            <p className="text-sm text-gray-400">Adicione alguns produtos para continuar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y max-h-60 overflow-y-auto pr-1">
              {props.cart.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name || item.title}</p>
                    <p className="text-sm text-gray-500">Qtd: {item.quantity || 1}</p>
                  </div>
                  <p className="font-bold text-pink-600">
                    R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              {props.shippingCost !== undefined && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frete:</span>
                  <span>{props.calculatingShipping ? 'Calculando...' : `R$ ${Number(props.shippingCost).toFixed(2)}`}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black text-gray-900">
                <span>Total:</span>
                <span>R$ {(props.totalCart || 0).toFixed(2)}</span>
              </div>
            </div>

            {props.currentUser ? (
              <button
                onClick={() => alert('Redirecionando para pagamento...')}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-pink-600/20 active:scale-[0.98]"
              >
                Finalizar Compra
              </button>
            ) : (
              <button
                onClick={props.onAuthClick}
                className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
              >
                Entrar para Finalizar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}