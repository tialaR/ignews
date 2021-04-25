import Head from 'next/head';
import { GetStaticProps } from 'next';
import { SubscribeButton } from '../components/SubscribeButton';

import styles from './home.module.scss';
import { stripe } from '../services/stripe';

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> World</h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding"/>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  //Utilizando api do stripe para fazer requisição hhtp (requisição do preço do produto):
  const price = await stripe.prices.retrieve('price_1Ici1YIe3TIvt0Gef3RynLT8', {
    expand: ['product']
  });

  //Criando produto a partir das informções requisitadas no stripe
  const product = {
    priceId: price.id, //Id do produto
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100) //Preço unitário em centavos formatado
  }

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24,
  }
}
