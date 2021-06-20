import { render, screen } from '@testing-library/react';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { mocked } from 'ts-jest/utils';
import { useSession } from 'next-auth/client';
import { getPrismicClient } from '../../services/prismic';
import { useRouter } from 'next/router';

const post = {
      slug: 'my-new-post',
      title: 'My New Post',
      content: '<p>Post excerpt</p>',
      updatedAt: '01 de abril de 2021'
};

/* Mocando a parte de rotas do next */
jest.mock('next/router')

/* Mocando o next-auth */
jest.mock('next-auth/client')

/* Mocando o prismic */
jest.mock('../../services/prismic');

describe('Post page', () => {
    it('renders correctly', () => {
        const useSessionMocked = mocked(useSession);

        //Estabelecendo q/ o usuário não está autenticado
        useSessionMocked.mockReturnValueOnce([null, false])

        render(<Post post={post} />)

        expect(screen.getByText('My New Post')).toBeInTheDocument()
        expect(screen.getByText('Post excerpt')).toBeInTheDocument()
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
    })

    /*  Verificando o redirect => se a página redireciona o usuário para o post completo 
    no momento do acesso caso ele já tenha uma subscription ativa*/
    it('redirects user to full post when user is subscribed', async () => {
        const useSessionMocked = mocked(useSession);
        const useRouterMocked = mocked(useRouter);

        //Mocando p/ o usuário ter uma subscription ativa
        useSessionMocked.mockReturnValueOnce([
               { activeSubscription: 'fake-active-subscription' },
               false,
        ] as any)

        const pushMock = jest.fn();
        /*Mocando a função push do useRouter p/ verificar posteriormente se ela
        foi chamada */
        useRouterMocked.mockReturnValueOnce({ 
            push: pushMock,
         }as any)

         render(<Post post={post} />)

         /* Ao renderizar a página espero q a função post tenha sido chamada
         com o parâmetro my-new-post */
         expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
    })

    /* Testando o getStaticProps */
    it('loads initial data', async () => {

        const getPrismicClientMocked = mocked(getPrismicClient)
        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                      { title: 'heading', text: 'My New Post'}
                    ],
                    content: [
                      { type: 'paragraph', text: 'Post excerpt' }
                    ],
                },
                last_publication_date: '04-01-2021'
            })
        } as any)

        const response = await getStaticProps({
            params: { slug: 'my-new-post' }
        } as any)

        /*Verifica se o objeto conterá as informações esperadas*/
        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My New Post',
                        content: '<p>Post excerpt</p>',
                        updatedAt: '01 de abril de 2021'
                    }
                }
            })
          )
    })
})