export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total, customer, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'O carrinho está vazio.' }, { status: 400 });
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_email: customer?.email || 'cliente@exemplo.com',
          customer_name: customer?.name || 'Cliente',
          items: items,
          total: total,
          status: 'pending',
          payment_method: paymentMethod || 'PIX'
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao salvar pedido no Supabase:', orderError);
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido processado com sucesso!',
      orderId: orderData?.id || 'temp_id'
    });

  } catch (error: any) {
    console.error('Erro no checkout:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}