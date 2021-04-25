import Stripe from 'stripe';
import { version } from '../../package.json';

//Utilizando API do stripe para reaizar requisições:
export const stripe = new Stripe(
    process.env.STRIPE_API_KEY, //chave stripe
    {
        apiVersion: '2020-08-27', //Versão da api do stripe
        appInfo: { //Informações de metadados
            name: 'Ignews', //Nome da aplicação
            version //versão da aplicação
        }
    }
);