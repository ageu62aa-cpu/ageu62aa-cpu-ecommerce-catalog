'use client';

import { useState } from 'react';

interface OpcaoFrete {
  id: number;
  nome: string;
  preco: number;
  prazoDias: number;
  empresa: string;
  foto: string;
}

export default function CheckoutPage() {
  // Dados do formulário
  const [cep, setCep] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [numeroEndereco, setNumeroEndereco] = useState('');

  // Estados de Frete
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(null);
  const [carregandoFrete, setCarregandoFrete] = useState(false);

  // Estados de Pagamento
  const [metodoPagamento, setMetodoPagamento] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [processando, setProcessando] = useState(false);
  const [dadosPix, setDadosPix] = useState<{ encodedImage: string; payload: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Exemplo de itens do carrinho (pode ser integrado com seu estado global/localStorage)
  const itensCarrinho = [
    {
      id: '1',
      nome: 'Produto Exemplo',
      largura: 15,
      altura: 10,
      comprimento: 20,
      peso: 0.5,
      preco: 50.0,
      quantidade: 1,
    },
  ];

  const subtotal = itensCarrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const valorFrete = freteSelecionado ? Number(freteSelecionado.preco) : 0;
  const totalGeral = subtotal + valorFrete;

  // 1. Buscar Cotação de Frete (Melhor Envio)
  const handleCalcularFrete = async () => {
    if (cep.replace(/\D/g, '').length !== 8) {
      alert('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setCarregandoFrete(true);
    setOpcoesFrete([]);
    setFreteSelecionado(null);

    try {
      const res = await fetch('/api/frete/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cepDestino: cep.replace(/\D/g, ''),
          produtos: itensCarrinho,
        }),
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setOpcoesFrete(data);
        if (data.length > 0) setFreteSelecionado(data[0]); // Seleciona a primeira opção por padrão
      } else {
        alert('Não foi possível calcular o frete para o CEP informado.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao consultar o serviço de frete.');
    } finally {
      setCarregandoFrete(false);
    }
  };

  // 2. Finalizar Pedido (Asaas)
  const handleFinalizarPedido = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!freteSelecionado) {
      alert('Por favor, selecione uma opção de frete antes de continuar.');
      return;
    }

    setProcessando(true);
    setErro(null);

    try {
      const res = await fetch('/api/checkout/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: {
            nome,
            email,
            cpfCnpj: cpfCnpj.replace(/\D/g, ''),
            telefone: telefone.replace(/\D/g, ''),
            cep: cep.replace(/\D/g, ''),
            numeroEndereco,
          },
          itens: itensCarrinho,
          valorFrete: freteSelecionado.preco,
          metodoPagamento,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar o pagamento.');
      }

      if (metodoPagamento === 'PIX' && data.pix) {
        setDadosPix(data.pix);
      } else {
        alert('Pedido realizado com sucesso!');
      }
    } catch (err: any) {
      setErro(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Se o Pix foi gerado, exibe a tela com o QR Code */}
      {dadosPix ? (
        <div className="col-span-2 bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Pedido Criado com Sucesso! 🎉</h2>
          <p className="text-gray-600 mb-6">Escaneie o QR Code abaixo ou copie a chave Pix para realizar o pagamento:</p>
          
          <div className="flex justify-center mb-4">
            <img
              src={`data:image/png;base64,${dadosPix.encodedImage}`}
              alt="QR Code Pix"
              className="w-64 h-64 border rounded"
            />
          </div>

          <div className="max-w-md mx-auto">
            <input
              type="text"
              readOnly
              value={dadosPix.payload}
              className="w-full p-2 border rounded bg-gray-50 text-xs font-mono text-center mb-3"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(dadosPix.payload);
                alert('Chave Pix copiada para a área de transferência!');
              }}
              className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition"
            >
              Copiar Chave Pix
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Formulário de Dados e Frete */}
          <form onSubmit={handleFinalizarPedido} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">1. Dados do Comprador</h2>
            
            <input
              type="text"
              placeholder="Nome Completo"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 border rounded"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                placeholder="E-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="CPF ou CNPJ"
                required
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Telefone / WhatsApp"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Número do Endereço"
                required
                value={numeroEndereco}
                onChange={(e) => setNumeroEndereco(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <h2 className="text-xl font-bold text-gray-800 pt-4">2. Calcular Frete</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CEP de Entrega"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <button
                type="button"
                onClick={handleCalcularFrete}
                disabled={carregandoFrete}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
              >
                {carregandoFrete ? 'Calculando...' : 'Buscar'}
              </button>
            </div>

            {/* Opções de Frete */}
            {opcoesFrete.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-sm font-semibold text-gray-600">Escolha a opção de envio:</p>
                {opcoesFrete.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-3 border rounded cursor-pointer ${
                      freteSelecionado?.id === item.id ? 'border-blue-600 bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="frete"
                        checked={freteSelecionado?.id === item.id}
                        onChange={() => setFreteSelecionado(item)}
                      />
                      <div>
                        <p className="font-semibold">{item.empresa} - {item.nome}</p>
                        <p className="text-xs text-gray-500">Chega em até {item.prazoDias} dias úteis</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-800">
                      R$ {Number(item.preco).toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <h2 className="text-xl font-bold text-gray-800 pt-4">3. Forma de Pagamento</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pagamento"
                  value="PIX"
                  checked={metodoPagamento === 'PIX'}
                  onChange={() => setMetodoPagamento('PIX')}
                />
                <span className="font-semibold">Pix</span>
              </label>
            </div>

            {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}

            <button
              type="submit"
              disabled={processando || !freteSelecionado}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 mt-6"
            >
              {processando ? 'Processando Pedido...' : 'Finalizar Pedido'}
            </button>
          </form>

          {/* Resumo do Pedido */}
          <div className="bg-gray-50 p-6 rounded-lg border h-fit space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Resumo da Compra</h2>
            
            {itensCarrinho.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <p className="font-semibold">{item.nome}</p>
                  <p className="text-xs text-gray-500">Qtd: {item.quantidade}</p>
                </div>
                <p className="font-semibold">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
              </div>
            ))}

            <div className="space-y-1 text-sm text-gray-600 pt-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete:</span>
                <span>{freteSelecionado ? `R$ ${valorFrete.toFixed(2)}` : 'A calcular'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2">
                <span>Total:</span>
                <span>R$ {totalGeral.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}