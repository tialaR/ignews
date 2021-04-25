import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/managerSubscription";

/* Transformando a requisição feita pelo stripe através de webhooks 
em algo que seja legível para desenvolvedores dentro do JS (pois as 
informações retornadas pelo stripe como resposta da requisição vem aos poucos
através de stream) */
async function buffer(readable: Readable) { //Código pronto extraído da documentação
    const chunks = [];

    for await (const chunk of readable) {
        chunks.push(
            typeof chunk === 'string' ? Buffer.from(chunk) : chunk
        );
    } 
    return Buffer.concat(chunks);
}

/* bodyParser: false -> Desabilitando o entendimento padrão do next sobre o que está vindo como resposta da requisição,
isso é necessário, pois por padrão o next entende as respostas das requisições como arquivos json,
formulários, etc... e não entende por padrão arquivos readable 
Dica: ver documentação do bodyParser no next
*/
export const config = {
    api: {
        bodyParser: false,
    }
}

//Estabelecendo eventos webhooks relevantes a serem escutados pela aplicação
const relevantEvents = new Set([
    'checkout.session.completed', //Evento de pagamento da assinatura 
    'customer.subscription.updated',
    'customer.subscription.deleted'
]);

//Ouvindo eventos de webhooks do stripe
export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST') {
        const buf = await buffer(req); //Dentro do buf estão contidos todos os dados da requisição

        //Verificando construção de objeto de eventos do webhooks do stripe
        const secret = req.headers['stripe-signature'];
        let event: Stripe.Event;
        try {
            //Construindo eventos dos webhooks (comparando header enviado na request com a secret criada para a request da rota)
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            return res.status(400).send(`Webhook error: ${err.message}`)
        }

        const { type } = event;

        if(relevantEvents.has(type)) {
            try {
                switch(type) {
                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted': 
                        const subscription = event.data.object as Stripe.Subscription;
                        await saveSubscription(
                            subscription.id,
                            subscription.customer.toString(),
                            false,
                        )
                        break;
                    case 'checkout.session.completed': 
                        const checkoutSession = event.data.object as Stripe.Checkout.Session;
                        await saveSubscription(
                            checkoutSession.subscription.toString(),
                            checkoutSession.customer.toString(),
                            true
                        );
                        break;
                    default:
                        throw new Error('Unhandled event.');
                }
            } catch (err) {
                return res.json({ error: 'Webhook handle failed.' });
            }
        }

        return res.json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed');
    }
}