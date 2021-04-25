import { GetServerSideProps } from "next";
import Head from 'next/head';
import { getSession } from "next-auth/client";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../services/prismic";

import styles from './post.module.scss';

interface PostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function Post({ post }: PostProps) {
    return(
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>

                    <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content}} />
                </article>
            </main>
        </>
    );
};

/*
→ Toda página que é gerada de forma estática com o **getSaticProps** é 
uma página que **não é protegida**, ou seja, é uma **página pública** por isso não vamos
utiliza-la nesse caso, pois queremos que somente os usuários que tem assinatura possam
ver o conteúdo completo do post.
→ quando queremos garantir com total certeza que o usuário não terá acesso 
a um determinado conteúdo devemos utilizar o método **getServerSideProps** 
ao invés do **getSaticProps** .
*/
export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    //Recuperando sessão do usuário para verificar se o usuário está logado
    const session = await getSession({ req });

    //Recuperando qual post foi acessado através do slug
    const { slug } = params;

    //Caso o usuário não tenha uma inscrição ativa será redirecionado para outro lugar da aplicação
    if(!session?.activeSubscription) {
        return {
            redirect: {
                destination: `/posts/preview/${slug}`,
                permanent: false,
            }
        }    
    }

    //Carregando cliente do prismic
    const prismic = getPrismicClient(req);

    //Buscando documento acessado (post) pelo UID no prismic
    const response = await prismic.getByUID('publication', String(slug), {});

    //Formatando os dados
    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };

    return {
        props: { post }
    }
}