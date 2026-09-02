import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Inicializa o cliente Supabase dentro da função para evitar erros no build estático
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const {
      cliente,       // Objeto: { nome, email, cpfCnpj, telefone, cep, numeroEndereco }
      itens,         // Array de produtos
      valorFrete,    // Valor numérico do frete
      metodoPagamento, // 'PIX' ou 'CREDIT_CARD'
      dadosCartao,    // Objeto com dados do cartão (apenas se metodoPagamento === 'CREDIT_CARD')
      tenantId,       // ID do tenant (loja)
    } = body;

    // Validação básica dos dados recebidos
    if (!cliente || !itens || itens.length === 0 || valorFrete === undefined || !metodoPagamento) {
      return NextResponse.json(
        { error: 'Dados incompletos para processar o pagamento.' },
        { status: 400 }
      );
    }

    // Cálculo dos valores
    const valorProdutos = itens.reduce(
      (acc: number, item: any) => acc + item.preco * item.quantidade,
      0
    );
    const valorTotal = valorProdutos + Number(valorFrete);

    const headersAsaas = {
      'Content-Type': 'application/json',
      'access_token': process.env.ASAAS_API_KEY!,
    };

    // -------------------------------------------------------------
    // 1. Criar ou Buscar Cliente no Asaas
    // -------------------------------------------------------------
    const resCliente = await fetch(`${process.env.ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: headersAsaas,
      body: JSON.stringify({
        name: cliente.nome,
        email: cliente.email,
        cpfCnpj: cliente.cpfCnpj.replace(/\D/g, ''),
        phone: cliente.telefone.replace(/\D/g, ''),
      }),
    });

    const dataCliente = await resCliente.json();
    const customerId = dataCliente.id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Erro ao cadastrar cliente no Asaas.', details: dataCliente },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------
    // 2. Criar Cobrança no Asaas
    // -------------------------------------------------------------
    const payloadCobranca: any = {
      customer: customerId,
      billingType: metodoPagamento,
      value: valorTotal,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Vencimento em 24h
      description: `Pedido na loja - Tenant: ${tenantId || process.env.NEXT_PUBLIC_INITIAL_TENANT_ID}`,
    };

    // Dados adicionais caso o pagamento seja via Cartão de Crédito
    if (metodoPagamento === 'CREDIT_CARD' && dadosCartao) {
      payloadCobranca.creditCard = {
        holderName: dadosCartao.nomeImpresso,
        number: dadosCartao.numero.replace(/\s/g, ''),
        expiryMonth: dadosCartao.mesValidade,
        expiryYear: dadosCartao.anoValidade,
        ccv: dadosCartao.ccv,
      };
      payloadCobranca.creditCardHolderInfo = {
        name: cliente.nome,
        email: cliente.email,
        cpfCnpj: cliente.cpfCnpj.replace(/\D/g, ''),
        postalCode: cliente.cep.replace(/\D/g, ''),
        addressNumber: cliente.numeroEndereco,
        phone: cliente.telefone.replace(/\D/g, ''),
      };
    }

    const resCobranca = await fetch(`${process.env.ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: headersAsaas,
      body: JSON.stringify(payloadCobranca),
    });

    const dataCobranca = await resCobranca.json();

    if (!resCobranca.ok) {
      return NextResponse.json(
        { error: 'Erro ao gerar cobrança no Asaas.', details: dataCobranca },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------
    // 3. Se for PIX, buscar o QR Code e o Copia e Cola
    // -------------------------------------------------------------
    let dadosPix = null;
    if (metodoPagamento === 'PIX') {
      const resPix = await fetch(
        `${process.env.ASAAS_API_URL}/payments/${dataCobranca.id}/pixQrCode`,
        { headers: headersAsaas }
      );
      dadosPix = await resPix.json();
    }

    // -------------------------------------------------------------
    // 4. Salvar o Pedido no Supabase com status "Pendente"
    // -------------------------------------------------------------
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tenant_id: tenantId || process.env.NEXT_PUBLIC_INITIAL_TENANT_ID,
        cliente_dados: cliente,
        itens: itens,
        valor_produtos: valorProdutos,
        valor_frete: valorFrete,
        valor_total: valorTotal,
        status: 'Pendente',
        gateway_payment_id: dataCobranca.id,
        metodo_pagamento: metodoPagamento,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao salvar pedido no Supabase:', orderError);
    }

    // -------------------------------------------------------------
    // 5. Retornar a resposta estruturada para o Frontend
    // -------------------------------------------------------------
    return NextResponse.json({
      sucesso: true,
      pedidoId: order?.id,
      paymentId: dataCobranca.id,
      status: dataCobranca.status,
      pix: dadosPix
        ? {
            encodedImage: dadosPix.encodedImage, // Imagem Base64 do QR Code
            payload: dadosPix.payload,           // Chave Copia e Cola
            expirationDate: dadosPix.expirationDate,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Erro no checkout:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar o checkout.', details: error.message },
      { status: 500 }
    );
  }
}