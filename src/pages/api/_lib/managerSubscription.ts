import { fauna } from "../../../services/fauna";
import { query as q } from 'faunadb';
import { stripe } from "../../../services/stripe";

/* Salvando informações no banco de dados */
export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false
) {
    /*Buscar usuário no BD do Fauna com o customerId (stripe_customer_id) e para isso devo criar
    um indice no fauna para que essa busca seja posível*/
    const userRef = await fauna.query(
        q.Select(
            "ref", 
            q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
        )
    );

    //Salvando dados da subscription do usuário dentro do BD do Fauna
    //Salvar dados da subscription do usuário no FaunaDB (as inscrições do usuário serão salvas em uma nova colection do banco)
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }
    
    if(createAction) {
        //Criando registro no fauna
        await fauna.query(
            q.Create(q.Collection('subscriptions'), { data: subscriptionData })
        );
    } else {
        //Atualizando registro no fauna (através de Replace - trocando todos os dados por novos dados)
        await fauna.query(
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(q.Match(q.Index("subscription_by_id", subscriptionId)))
                ),
                { data: subscriptionData }
            )
        );
    }
}