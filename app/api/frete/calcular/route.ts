import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cepDestino, products } = body;

    // Token do Sandbox do Melhor Envio fornecido
    const melhorEnvioToken = '$token_aqui_ou_via_env'; // ou process.env.MELHOR_ENVIO_TOKEN
    
    // CEP de origem padrão da loja (exemplo, altere para o seu CEP de despacho)
    const cepOrigem = process.env.NEXT_PUBLIC_CEP_ORIGEM || '01001000';

    // Monta os produtos no formato exigido pela API do Melhor Envio
    const formattedProducts = products && products.length > 0 ? products.map((item: any) => ({
      id: String(item.id || '1'),
      width: item.width || 11,
      height: item.height || 11,
      length: item.length || 16,
      weight: item.weight || 0.3,
      insurance_value: item.price || 50.0,
      quantity: item.quantity || 1
    })) : [
      {
        id: '1',
        width: 11,
        height: 11,
        length: 16,
        weight: 0.3,
        insurance_value: 50.0,
        quantity: 1
      }
    ];

    // Requisição para a API de cálculo do Melhor Envio (Sandbox)
    const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NT6...'}` ,
        'User-Agent': 'Aplicação lucymake.ecommerce (contato@lucymake.com)'
      },
      body: JSON.stringify({
        from: {
          postal_code: cepOrigem.replace(/\D/g, '')
        },
        to: {
          postal_code: cepDestino.replace(/\D/g, '')
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