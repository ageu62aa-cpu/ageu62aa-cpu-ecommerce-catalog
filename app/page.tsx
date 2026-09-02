// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Product, CartItem } from '@/types/product';
import { ShoppingCart, Trash2, Plus, Minus, Check, ShoppingBag } from 'lucide-react';

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');

  const tenantId = process.env.NEXT_PUBLIC_INITIAL_TENANT_ID;

  useEffect(() => {
    async function fetchProducts() {
      if (!tenantId) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('active', true);

      if (error) {
        console.error('Erro ao buscar produtos:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [tenantId]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCart = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Catálogo Online</h1>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-medium text-sm shadow-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Carrinho</span>
            {totalItemsCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1 animate-pulse">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Barra de Busca */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
          />
        </div>

        {/* Estado de Carregamento e Grid de Produtos */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">
            Carregando produtos do catálogo...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <img
                    src={product.image_url || 'https://via.placeholder.com/300?text=Sem+Imagem'}
                    alt={product.name}
                    className="w-full h-48 object-cover bg-slate-100"
                  />
                  <div className="p-4">
                    <h2 className="font-bold text-base text-slate-800 line-clamp-1">{product.name}</h2>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px]">
                      {product.description || 'Sem descrição cadastrada.'}
                    </p>
                    <p className="text-lg font-black text-emerald-600 mt-3">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Painel Lateral do Carrinho (Drawer) */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" /> Seu Carrinho
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-center text-slate-500 py-12 text-sm">O seu carrinho está vazio.</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b border-slate-100 pb-3"
                    >
                      <div className="max-w-[180px]">
                        <h3 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h3>
                        <p className="text-xs text-emerald-600 font-bold">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between font-bold text-lg mb-4 text-slate-800">
                <span>Total:</span>
                <span className="text-emerald-600">R$ {totalCart.toFixed(2)}</span>
              </div>
              <button
                disabled={cart.length === 0}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm text-sm"
              >
                Ir para o Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}