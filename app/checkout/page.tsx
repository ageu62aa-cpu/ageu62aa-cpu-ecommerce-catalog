'use client';
// @ts-nocheck

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState('PIX');
  
  const [cliente, setCliente] = useState({
    nome: '',
    email: '',
    cpfCnpj: '',
    telefone: '',
    cep: '',
    numeroEndereco: '',
  });

  const [dadosCartao, setDadosCartao] = useState({
    nomeImpresso: '',
    numero: '',
    mesValidade: '',
    anoValidade: '',
    ccv: '',
  });

  const [resultadoPagamento, setResultadoPagamento] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleCartaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDadosCartao((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const carrinhoSalvo = localStorage.getItem('cart');
      const itens = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [
        { id: 1, name: 'Batom Matte Luxo', preco: 49.90, quantity: 1 }
      ];

      const valorFreteSalvo = localStorage.getItem('shippingCost');
      const valorFrete = valorFreteSalvo ? Number(valorFreteSalvo) : 15.00;

      const response = await fetch('/api/checkout/pagar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente,
          itens,
          valorFrete,
          metodoPagamento,
          dadosCartao: metodoPagamento === 'CREDIT_CARD' ? dadosCartao : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento.');
      }

      setResultadoPagamento(data);
    } catch (err: any) {
      alert(`Erro no checkout: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 w-full">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Finalização do Pedido</h1>
        <p className="text-gray-600 mb-8">Preencha seus dados para concluir a compra na Lucymake via Asaas.</p>

        {resultadoPagamento ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <h2 className="text-xl font-bold text-green-800 mb-2">Pedido Criado com Sucesso!</h2>
              <p className="text-sm text-green-600">ID da Cobrança: {resultadoPagamento.paymentId}</p>
              <p className="text-sm font-semibold text-gray-700 mt-2">Status: {resultadoPagamento.status}</p>
            </div>

            {resultadoPagamento.pix && (
              <div className="space-y-4">
                <p className="text-gray-700 font-medium">Escaneie o QR Code abaixo ou utilize o Pix Copia e Cola:</p>
                {resultadoPagamento.pix.encodedImage && (
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${resultadoPagamento.pix.encodedImage}`} 
                      alt="QR Code Pix" 
                      className="w-48 h-48 border rounded-lg shadow-sm"
                    />
                  </div>
                )}
                <div className="bg-gray-100 p-3 rounded-lg text-xs break-all font-mono text-gray-800">
                  {resultadoPagamento.pix.payload}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resultadoPagamento.pix.payload);
                    alert('Chave Pix Copia e Cola copiada para a área de transferência!');
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow"
                >
                  Copiar Chave Pix
                </button>
              </div>
            )}

            <button
              onClick={() => router.push('/')}
              className="block w-full mt-6 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition"
            >
              Voltar à Loja
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitCheckout} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">1. Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    name="nome"
                    required
                    value={cliente.nome}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm"
                    placeholder="Maria Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={cliente.email}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm"
                    placeholder="maria@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    name="cpfCnpj"
                    required
                    value={cliente.cpfCnpj}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    name="telefone"
                    required
                    value={cliente.telefone}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    required
                    value={cliente.cep}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm"
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número do Endereço</label>
                  <input
                    type="text"
                    name="numeroEndereco"
                    required
                    value={cliente.numeroEndereco}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">2. Forma de Pagamento</h2>
              <div className="flex gap-4">
                <label className={`flex-1 border p-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 font-medium transition ${metodoPagamento === 'PIX' ? 'border-pink-600 bg-pink-50 text-pink-700' : 'text-gray-700'}`}>
                  <input
                    type="radio"
                    name="metodoPagamento"
                    value="PIX"
                    checked={metodoPagamento === 'PIX'}
                    onChange={() => setMetodoPagamento('PIX')}
                    className="accent-pink-600"
                  />
                  Pix
                </label>
                <label className={`flex-1 border p-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 font-medium transition ${metodoPagamento === 'CREDIT_CARD' ? 'border-pink-600 bg-pink-50 text-pink-700' : 'text-gray-700'}`}>
                  <input
                    type="radio"
                    name="metodoPagamento"
                    value="CREDIT_CARD"
                    checked={metodoPagamento === 'CREDIT_CARD'}
                    onChange={() => setMetodoPagamento('CREDIT_CARD')}
                    className="accent-pink-600"
                  />
                  Cartão de Crédito
                </label>
              </div>

              {metodoPagamento === 'CREDIT_CARD' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border mt-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      name="nomeImpresso"
                      required={metodoPagamento === 'CREDIT_CARD'}
                      value={dadosCartao.nomeImpresso}
                      onChange={handleCartaoChange}
                      className="w-full border rounded-lg p-2.5 text-sm bg-white"
                      placeholder="MARIA S SILVA"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                    <input
                      type="text"
                      name="numero"
                      required={metodoPagamento === 'CREDIT_CARD'}
                      value={dadosCartao.numero}
                      onChange={handleCartaoChange}
                      className="w-full border rounded-lg p-2.5 text-sm bg-white"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mês de Validade</label>
                    <input
                      type="text"
                      name="mesValidade"
                      required={metodoPagamento === 'CREDIT_CARD'}
                      value={dadosCartao.mesValidade}
                      onChange={handleCartaoChange}
                      className="w-full border rounded-lg p-2.5 text-sm bg-white"
                      placeholder="MM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Validade</label>
                    <input
                      type="text"
                      name="anoValidade"
                      required={metodoPagamento === 'CREDIT_CARD'}
                      value={dadosCartao.anoValidade}
                      onChange={handleCartaoChange}
                      className="w-full border rounded-lg p-2.5 text-sm bg-white"
                      placeholder="AAAA"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CCV (CVV)</label>
                    <input
                      type="text"
                      name="ccv"
                      required={metodoPagamento === 'CREDIT_CARD'}
                      value={dadosCartao.ccv}
                      onChange={handleCartaoChange}
                      className="w-full border rounded-lg p-2.5 text-sm bg-white"
                      placeholder="123"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-pink-600/20 disabled:opacity-50"
            >
              {loading ? 'Processando Pagamento...' : 'Concluir Pagamento'}
            </button>
          </form>
        )}
      </div>

      <footer className="text-center text-sm text-gray-500 py-4">
        &copy; 2026 Lucymake. Todos os direitos reservados.
      </footer>
    </div>
  );
}