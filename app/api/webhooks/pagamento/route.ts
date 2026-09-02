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
    const { event, payment } = body;

    // Log para depuração de eventos recebidos
    console.log(`[Asaas Webhook] Evento recebido: ${event} - Payment ID: ${payment?.id}`);

    // Eventos que confirmam que o pagamento foi realizado com sucesso
    const eventosPagos = [
      'PAYMENT_RECEIVED',
      'PAYMENT_CONFIRMED',
      'PAYMENT_DUNNING_RECEIVED',
    ];

    if (eventosPagos.includes(event) && payment?.id) {
      // Atualiza o status do pedido para "Pago" no Supabase
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'Pago' })
        .eq('gateway_payment_id', payment.id)
        .select();

      if (error) {
        console.error('[Asaas Webhook] Erro ao atualizar pedido no Supabase:', error);
        return NextResponse.json({ error: 'Erro ao atualizar banco de dados' }, { status: 500 });
      }

      console.log(`[Asaas Webhook] Pedido com gateway_payment_id ${payment.id} atualizado para 'Pago'.`);
    }

    // Retorna status 200 para confirmar o recebimento do evento ao Asaas
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Asaas Webhook] Erro no processamento do webhook:', error);
    return NextResponse.json({ error: 'Erro interno no processamento do webhook' }, { status: 500 });
  }
}