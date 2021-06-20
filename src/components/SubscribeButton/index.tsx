import { useSession, signIn } from 'next-auth/client';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

export function SubscribeButton() {
    const [session] = useSession();
    const router = useRouter();

    async function handleSubscribe() {
        //Caso o usuário não esteja logado (redirecionar p/ login com o github)
        if(!session) {
            signIn('github');
            return;
        }

        /* Caso o usuário já tenha uma assinatura ativa será redirecionado 
        para a pagina de posts(a aplicação não vai deixar q/ ele faça uma assinatura
        novamente) */
        if(session.activeSubscription) {
            router.push('/posts');
            return;
        }

        //Caso o usuário esteja logado: Fazer a criação da checkout session no stripe
        try {
            //Requisição a rota subscribe:
            const response = await api.post('/subscribe');
            const { sessionId } = response.data;
            const stripe = await getStripeJs();
            await stripe.redirectToCheckout({ sessionId }); //Redirecionando usuário p/ o checkout
        } catch (err) {
            alert(err.message);
        }
    }

    return(
        <button 
            type="button"
            className={styles.subscribeButton}
            onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    );
}