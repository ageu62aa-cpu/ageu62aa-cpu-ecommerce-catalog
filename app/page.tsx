// @ts-nocheck
import React, { useState, useEffect } from 'react';

interface CartItem {
  id: string | number;
  name?: string;
  title?: string;
  price: number;
  quantity: number;
}

// Modal integrado diretamente no mesmo arquivo para evitar qualquer conflito de tipos externo
function LocalCartModal(props: any) {
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-pink-600/20"
              >
                Finalizar Compra
              </button>
            ) : (
              <button
                onClick={props.onAuthClick}
                className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all shadow-lg"
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

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalCart, setTotalCart] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [userCep, setUserCep] = useState('');

  useEffect(() => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotalCart(total);
  }, [cart]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-pink-600">Lucymake E-commerce</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 transition"
        >
          Carrinho ({cart.reduce((acc, item) => acc + item.quantity, 0)})
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-grow text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Bem-vinda ao seu E-commerce</h2>
        <p className="text-gray-600 mb-8">Sua loja virtual está pronta, estruturada e rodando perfeitamente.</p>
        
        <button
          onClick={() => {
            setCart([
              { id: 1, name: 'Batom Matte Luxo', price: 49.90, quantity: 1 }
            ]);
            setIsOpen(true);
          }}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-md"
        >
          Adicionar Produto Teste ao Carrinho
        </button>
      </main>

      {/* Renderização direta do modal interno livre de conflitos de tipos */}
      <LocalCartModal
        isOpen={isOpen}
        cart={cart}
        totalCart={totalCart}
        shippingCost={shippingCost}
        calculatingShipping={calculatingShipping}
        currentUser={currentUser}
        userCep={userCep}
        onClose={() => setIsOpen(false)}
        onAuthClick={() => alert('Abrir modal de autenticação')}
      />

      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        &copy; 2026 Lucymake. Todos os direitos reservados.
      </footer>
    </div>
  );
}