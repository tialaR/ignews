//Serviço que integra o stripe so back-end com o stripe do front-end da aplicação
import { loadStripe } from '@stripe/stripe-js';

export async function getStripeJs() {
    const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

    return stripeJs;
}

/* Toda variável ambiente que precisa ser carregada diretamente no browser precisa ser pública.
E a única forma de deixar as variáveis ambiente públicas no Next
 é colocando NEXT_PUBLIC no inicio delas */
