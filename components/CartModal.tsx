// @ts-nocheck
'use client';

import { X, ShoppingCart, Minus, Plus, Truck, Loader2 } from 'lucide-react';

export default function CartModal(props: any) {
  if (!props.isOpen) return null;

  const {
    isOpen,
    onClose,
    cart = [],
    totalCart = 0,
    shippingCost = 0,
    calculatingShipping = false,
    userCep = '',
    currentUser,
    onUpdateQuantity,
    onCalculateShipping,
    onCepChange,
    onCheckout,
    onAuthClick,
  } = props;

  const handleCheckout = () => {
    if (!currentUser) {
      alert('Por favor, faça login para finalizar o pedido.');
      onClose();
      onAuthClick();
    } else {
      onCheckout();
    }
  };

  const finalTotal = totalCart + shippingCost;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end transition-opacity">
      <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          <div className="flex justify-between items-center border-b border-pink-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-pink-500" /> Seu Carrinho
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">✕</button>
          </div>

          <div className="mt-4 space-y-4 max-h-[42vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-center text-slate-500 py-12 text-sm">O seu carrinho está vazio.</p>
            ) : (
              cart.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="max-w-[180px]">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h3>
                    <p className="text-xs text-pink-600 font-bold">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1.5 border border-pink-200 rounded-lg hover:bg-pink-50 text-slate-600"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1.5 border border-pink-200 rounded-lg hover:bg-pink-50 text-slate-600"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-pink-100 pt-4 space-y-3">
          {cart.length > 0 && (
            <div className="bg-pink-50/60 p-3 rounded-xl border border-pink-100 space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-pink-500" /> Calcular Frete (CEP)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={userCep}
                  onChange={(e) => onCepChange && onCepChange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-pink-200 text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 bg-white"
                />
                <button
                  onClick={() => onCalculateShipping && onCalculateShipping(userCep)}
                  disabled={calculatingShipping}
                  className="bg-pink-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-pink-600 transition flex items-center justify-center min-w-[70px]"
                >
                  {calculatingShipping ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Calcular'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>R$ {totalCart.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Frete:</span>
              <span>{shippingCost > 0 ? `R$ ${shippingCost.toFixed(2)}` : 'A calcular'}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-slate-800 pt-1 border-t border-slate-100">
              <span>Total:</span>
              <span className="text-pink-600">R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 disabled:opacity-50 transition shadow-md shadow-pink-200 text-sm cursor-pointer"
          >
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}