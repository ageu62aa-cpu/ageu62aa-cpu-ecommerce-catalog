// @ts-nocheck
import React from 'react';
import { useRouter } from 'next/navigation';

export default function CartModal(props: any) {
  const router = useRouter();

  if (!props.isOpen) return null;

  const handleCheckout = () => {
    if (props.onClose) props.onClose();
    router.push('/checkout');
  };

  const handleAuthRedirect = () => {
    if (props.onClose) props.onClose();
    router.push('/login');
  };

  return (
    <div>
      <div>
        <button onClick={props.onClose}>
          &times;
        </button>

        <h2>
          🛒 Seu Carrinho
        </h2>

        {(!props.cart || props.cart.length === 0) ? (
          <div>
            <p>Seu carrinho está vazio.</p>
            <p>Adicione alguns produtos para continuar.</p>
          </div>
        ) : (
          <div>
            <div>
              {props.cart.map((item: any, index: number) => (
                <div key={index}>
                  <div>
                    <p>{item.name || item.title}</p>
                    <p>Qtd: {item.quantity || 1}</p>
                  </div>
                  <p>
                    R$ {((item.price || item.preco || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div>
              {props.shippingCost !== undefined && (
                <div>
                  <span>Frete:</span>
                  <span>{props.calculatingShipping ? 'Calculando...' : `R$ ${Number(props.shippingCost).toFixed(2)}`}</span>
                </div>
              )}
              <div>
                <span>Total:</span>
                <span>R$ {(props.totalCart || 0).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  if (props.onClose) props.onClose();
                  router.push('/carrinho');
                }}
              >
                Ver Carrinho Completo
              </button>

              {props.currentUser ? (
                <button
                  type="button"
                  onClick={handleCheckout}
                >
                  Finalizar Compra
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAuthRedirect}
                >
                  Entrar para Finalizar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}