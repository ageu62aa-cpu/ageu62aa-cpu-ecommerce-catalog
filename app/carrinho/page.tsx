'use client';
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CarrinhoPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [cep, setCep] = useState('');
  const [freteOpcoes, setFreteOpcoes] = useState<any[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<any>(null);
  const [loadingFrete, setLoadingFrete] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const atualizarQuantidade = (id: number, delta: number) => {
    const novoCarrinho = cart.map(item => {
      if (item.id === id) {
        const novaQtd = item.quantity + delta;
        return novaQtd > 0 ? { ...item, quantity: novaQtd } : null;
      }
      return item;
    }).filter(Boolean);

    setCart(novoCarrinho);
    localStorage.setItem('cart', JSON.stringify(novoCarrinho));
  };

  const calcularFrete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingFrete(true);
    try {
      const res = await fetch('/api/frete/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cepDestino: cep, itens: cart }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao calcular frete');
      setFreteOpcoes(data.options || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingFrete(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.preco * item.quantity), 0);
  const valorFrete = freteSelecionado ? Number(freteSelecionado.valor) : 0;
  const totalGeral = subtotal + valorFrete;

  const prosseguirCheckout = () => {
    if (cart.length === 0) return alert('Seu carrinho está vazio.');
    if (!freteSelecionado) return alert('Por favor, selecione uma opção de frete antes de continuar.');

    localStorage.setItem('shippingCost', valorFrete.toString());
    localStorage.setItem('selectedShipping', JSON.stringify(freteSelecionado));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Seu Carrinho de Compras</h1>

        {cart.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500 mb-4">Seu carrinho está vazio no momento.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-pink-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-pink-700 transition"
            >
              Voltar às Compras
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Lista de Produtos */}
            <div className="md:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border">
                  <div className="flex items-center gap-4">
                    <img src={item.imagem || item.image || '/placeholder.png'} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-pink-600 font-black">R$ {Number(item.preco).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => atualizarQuantidade(item.id, -1)} className="w-8 h-8 border rounded-lg font-bold text-gray-600 hover:bg-gray-100">-</button>
                    <span className="font-bold">{item.quantity}</span>
                    <button onClick={() => atualizarQuantidade(item.id, 1)} className="w-8 h-8 border rounded-lg font-bold text-gray-600 hover:bg-gray-100">+</button>
                  </div>
                </div>
              ))}

              {/* Bloco de Frete */}
              <div className="bg-white p-6 rounded-xl shadow-sm border mt-6">
                <h3 className="font-bold text-gray-800 mb-3">Simular Frete e Prazo</h3>
                <form onSubmit={calcularFrete} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite seu CEP"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="flex-1 border rounded-xl p-2.5 text-sm"
                    required
                  />
                  <button type="submit" disabled={loadingFrete} className="bg-gray-900 text-white font-bold px-5 rounded-xl hover:bg-black transition text-sm">
                    {loadingFrete ? 'Calculando...' : 'Calcular'}
                  </button>
                </form>

                {freteOpcoes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {freteOpcoes.map((opcao, idx) => (
                      <label key={idx} className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition ${freteSelecionado?.nome === opcao.nome ? 'border-pink-600 bg-pink-50' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="frete"
                            checked={freteSelecionado?.nome === opcao.nome}
                            onChange={() => setFreteSelecionado(opcao)}
                            className="accent-pink-600"
                          />
                          <div>
                            <p className="font-bold text-sm text-gray-800">{opcao.nome}</p>
                            <p className="text-xs text-gray-500">Prazo: {opcao.prazo}</p>
                          </div>
                        </div>
                        <span className="font-bold text-pink-600 text-sm">R$ {Number(opcao.valor).toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="bg-white p-6 rounded-xl shadow-sm border h-fit space-y-4">
              <h3 className="font-bold text-lg text-gray-900 border-b pb-3">Resumo do Pedido</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frete</span>
                <span>{freteSelecionado ? `R$ ${valorFrete.toFixed(2)}` : 'A calcular'}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-black text-lg text-gray-900">
                <span>Total</span>
                <span className="text-pink-600">R$ {totalGeral.toFixed(2)}</span>
              </div>

              <button
                onClick={prosseguirCheckout}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-pink-600/20 mt-4"
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}