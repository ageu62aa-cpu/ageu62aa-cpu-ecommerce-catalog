'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string | number;
  name?: string;
  title?: string;
  price: number;
  quantity: number;
}

export default function Page() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('lucymake_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const adicionarProdutoTeste = () => {
    const novoCarrinho = [
      { id: 1, name: 'Batom Matte Luxo', price: 49.90, quantity: 1 }
    ];
    setCart(novoCarrinho);
    localStorage.setItem('cart', JSON.stringify(novoCarrinho));
    router.push('/carrinho');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-pink-600 cursor-pointer" onClick={() => router.push('/')}>
          Lucymake E-commerce
        </h1>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <span className="text-sm font-bold text-gray-700">Olá, {currentUser.name}</span>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="text-sm font-semibold text-gray-700 hover:text-pink-600 transition"
            >
              Entrar / Cadastrar
            </button>
          )}

          <button
            onClick={() => router.push('/carrinho')}
            className="bg-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-pink-700 transition flex items-center gap-2 shadow-sm"
          >
            🛒 Carrinho ({totalItems})
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16 flex-grow text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-4">Bem-vinda ao seu E-commerce</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">Sua loja virtual está rodando com páginas dedicadas.</p>
        
        <button
          onClick={adicionarProdutoTeste}
          className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg text-sm"
        >
          Adicionar Produto Teste e Ver Carrinho
        </button>
      </main>

      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        &copy; 2026 Lucymake. Todos os direitos reservados.
      </footer>
    </div>
  );
}