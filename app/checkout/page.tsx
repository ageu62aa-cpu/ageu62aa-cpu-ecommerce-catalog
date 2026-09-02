// @ts-nocheck
import React, { useState, useEffect } from 'react';
import CartModal from '@/components/CartModal';

interface CartItem {
  id: string | number;
  name?: string;
  title?: string;
  price: number;
  quantity: number;
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

      {/* @ts-ignore */}
      <CartModal
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