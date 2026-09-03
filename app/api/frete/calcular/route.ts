import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cepDestino, products } = body;

    const melhorEnvioToken = process.env.MELHOR_ENVIO_TOKEN;
    if (!melhorEnvioToken) {
      return NextResponse.json(
        { success: false, error: 'Token do Melhor Envio não configurado no ambiente.' },
        { status: 400 }
      );
    }

    const cepOrigem = process.env.NEXT_PUBLIC_CEP_ORIGEM;
    if (!cepOrigem) {
      return NextResponse.json(
        { success: false, error: 'CEP de origem não configurado no ambiente.' },
        { status: 400 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum produto enviado para o cálculo de frete.' },
        { status: 400 }
      );
    }

    const formattedProducts = products.map((item: any) => ({
      id: String(item.id),
      width: Number(item.width),
      height: Number(item.height),
      length: Number(item.length),
      weight: Number(item.weight),
      insurance_value: Number(item.price || item.preco),
      quantity: Number(item.quantity || 1)
    }));

    const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${melhorEnvioToken}`,
        'User-Agent': 'Aplicação lucymake.ecommerce (contato@lucymake.com)'
      },
      body: JSON.stringify({
        from: {
          postal_code: cepOrigem.replace(/\D/g, '')
        },
        to: {
          postal_code: String(cepDestino).replace(/\D/g, '')
        },
        products: formattedProducts
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, error: data }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      shippingOptions: data
    });

  } catch (error: any) {
    console.error('Erro ao calcular frete no Melhor Envio:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}