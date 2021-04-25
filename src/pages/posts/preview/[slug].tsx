import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/client";
import Head from 'next/head';
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";

import styles from '../post.module.scss';

interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function PostPreview({ post }: PostPreviewProps) {
    const [session] = useSession();
    const router = useRouter();

    //Garantindo o redirecionamento do usuário quando a session mudar 
    useEffect(() => {
        if(session?.activeSubscription) {
            router.push(`/posts/${post.slug}`);
        }
    }, [session]);

    return(
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>

                    <div 
                        className={`${styles.postContent} ${styles.previewContent}`} 
                        dangerouslySetInnerHTML={{ __html: post.content}}
                    />

                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href="/">
                            <a>Subscribe now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking',
    }
}

/* Como a página do preview poderá ser vista por qualquer usuário então 
ela poderá ser uma página estática */
export const getStaticProps: GetStaticProps = async ({ params }) => {
    //Recuperando qual post foi acessado através do slug
    const { slug } = params;

    //Carregando cliente do prismic
    const prismic = getPrismicClient();

    //Buscando documento acessado (post) pelo UID no prismic
    const response = await prismic.getByUID('publication', String(slug), {});

    //Formatando os dados
    const post = {
        slug,
        title: RichText.asText(response.data.title),
        //Limitando o conteúdo a ser exibido no preview (exibindo somente os 3 prmeiros elementos do conteúdo)
        content: RichText.asHtml(response.data.content.slice(0, 3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };

    return {
        props: { post },
        revalidate: 60 * 30, //30 minutos
    }
}