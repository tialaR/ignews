import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";
import { query as q } from 'faunadb';

type User = {
    ref: {
        id: string;
    },
    data: {
        stripe_customer_id: string;
    }
}

//Rota para adesão do produto (ao clicar no botão subscribe):
export default async (req: NextApiRequest, res: NextApiResponse) => {
    /*Como essa função não é uma rota back-end eu não consigo dizer 
    que essa api route só vai estar disponível com o método http post, 
    por isso devo realizar a verificação para validar se o método da requisição é post, pois nesse caso 
    só quero aceitar requisições do tipo post, porque estou criando uma checkout session do stripe,
    ou seja estou criando algo */
    if(req.method === 'POST') {
        /* Caso o método seja do tipo post (quando o usuário clicar na intenção de compra)
         vou criar um customer e uma sessão do stripe: */
        /* Criando customer dentro do painel do stripe:
            1°) Obter qual é o usuário logado (A informação do token do usuário logado fica salva nos
                cookies) -> Os cookies podem ser acessados tanto na camada do front-end quanto
                na camada do back-end desde que estejam no mesmo domínio (Same side).
                -> Dificilmente no next vamos salvar informações persistentes como token e preferências
                do usuário no localStorage porque o localStorage só está disponível no browser, ou seja,
                ele não funciona no lado do back-end (api do next) 
        */

        //Recuprando sessão do usuário na aplicação (para recuperar os dados do usuário)
        const session = await getSession({ req });

        //Buscando usuário da sessão, por email, no BD fauna:
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email),
                )
            )
        );

        let customerId = user.data.stripe_customer_id;
        /*Caso o usuário não tenha uma prop chamada stripe_customer_id
         vou criar um usuário dele no stripe e adicionar a prop
          para esse usuário no BD do fauna */
        if(!customerId) {
            //Criando usuário no stripe:
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email, 
                //metadata: 
            });
    
            /*Adicionando prop stripe_customer_id ao usuário no fauna 
            (para guardar uma informação no Bd atrelado a esse usuário que ele 
            realizou a assinatura do produto no stripe) */
            await fauna.query( //Update no usuário inserindo stripe_customer_id como prop
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id, //Criando campo stripe_customer_id no BD do fauna
                        }
                    }
                )
            );

            //Atualizando o customerId
            customerId = stripeCustomer.id;
        }


        //Criando/iniciando sessão do usuário no stripe:
        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId, /* É quem está comprando o pacote - Cliente no painel do stripe */
            payment_method_types: ['card'], //Métodos de pagamentos q/ quero aceitar
            billing_address_collection: 'required', //Solicitar enderço do usuário
            line_items: [ //Itens q/ a pessoa terá dentro do carrinho
                { price: 'price_1Ici1YIe3TIvt0Gef3RynLT8', quantity: 1 } /* Estabelecendo que no carrinho terá uma assinatura do produto */
            ],
            mode: 'subscription', //Estabelecendo que o pagamento será recorrente e não uma única vez
            allow_promotion_codes: true, //Permitir a utilização de cupons de código pelo usuário
            success_url: process.env.STRIPE_SUCCESS_URL, //Para onde o usuário é redirecionado quando da sucesso
            cancel_url: process.env.STRIPE_CANCEL_URL, //Para onde o usuário é redirecionado quando cancela a requisição
        });

        return res.status(200).json({ sessionId: stripeCheckoutSession.id  });
    } else {
        /* Explicando p/ o front que o método que essa função aceita é do tipo post  */
        res.setHeader('Allow', 'POST');
        //em seguida devolvendo uma resposta com erro para o front
        res.status(405).end('Method not allowed');
    }
}