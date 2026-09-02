import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cepDestino, produtos } = body;

    if (!cepDestino || !produtos || produtos.length === 0) {
      return NextResponse.json(
        { error: 'CEP de destino e produtos são obrigatórios.' },
        { status: 400 }
      );
    }

    const volumes = produtos.map((item: any) => ({
      id: item.id,
      width: item.largura || 10,
      height: item.altura || 10,
      length: item.comprimento || 10,
      weight: item.peso || 0.3,
      insurance_value: item.preco * item.quantidade,
      quantity: item.quantidade,
    }));

    const response = await fetch(
      process.env.MELHOR_ENVIO_URL || 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
          'User-Agent': 'ECommerceApp (suporte@sualoja.com)',
        },
        body: JSON.stringify({
          from: { postal_code: process.env.CEP_ORIGEM },
          to: { postal_code: cepDestino.replace(/\D/g, '') },
          products: volumes,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao calcular frete no Melhor Envio', details: data },
        { status: response.status }
      );
    }

    const fretesValidos = data
      .filter((opcao: any) => !opcao.error)
      .map((opcao: any) => ({
        id: opcao.id,
        nome: opcao.name,
        preco: parseFloat(opcao.price),
        prazoDias: opcao.delivery_time,
        empresa: opcao.company.name,
        foto: opcao.company.picture,
      }));

    return NextResponse.json(fretesValidos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno no servidor ao calcular frete' },
      { status: 500 }
    );
  }
}