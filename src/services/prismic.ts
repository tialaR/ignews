import Prismic from '@prismicio/client';

//Criando uma função para criar o client do Prismic (segundo documentação) -> Para consumir os dados do prismic
/* Nessa forma de função toda vez que os dados forem ser consumidos o clinet 
(formos nos comunicar com o client do prismic) do prismic será instanciado de novo: */
export function getPrismicClient(req?: unknown) {
    const prismic = Prismic.client(
        process.env.PRISMIC_ENDPOINT,
        {
            req,
            accessToken: process.env.PRISMIC_ACCESS_TOKEN
        }
    );

    return prismic;
}