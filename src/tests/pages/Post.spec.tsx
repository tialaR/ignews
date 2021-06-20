import { render, screen } from '@testing-library/react';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { mocked } from 'ts-jest/utils';
import { getSession } from 'next-auth/client';
import { getPrismicClient } from '../../services/prismic';

const post = {
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post excerpt</p>',
    updatedAt: '10 de Abril'
  }
  
  /* Mocando o next-auth */
  jest.mock('next-auth/client')
  /* Mocando o prismic */
  jest.mock('../../services/prismic')

describe('Post page', () => {
    it('renders correctly', () => {

        render(<Post post={post} />)

        expect(screen.getByText('My New Post')).toBeInTheDocument()
        expect(screen.getByText('Post excerpt')).toBeInTheDocument()
    })

    /* Testando o getServerSideProps*/
    it('redirects user if no subscription is found', async () => {

        /* Mocando a função getSession que vem de dentro do next-auth/client */
        const getSessionMocked = mocked(getSession)

        /*Estabelecendo q/ quando a função getSession for chamada vou
        retornar um mock */
        getSessionMocked.mockResolvedValueOnce(null)

        const response = await getServerSideProps({
            params: { slug: 'my-new-post' }
        } as any)

        /*Verifica se o objeto do response conterá as informações esperadas*/
        expect(response).toEqual(
            expect.objectContaining({
              redirect: expect.objectContaining({
                destination: '/posts/preview/my-new-post'
              })
            })
        )
    })

    it('loads initial data', async () => {
        /*Teste que verifica se os dados do usuário estão sendo carregados
        caso ele esteja autenticado */

        const getSessionMocked = mocked(getSession)
        //Verificando se tem alguma coisa dentro de activeSubscription
        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        } as any)

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

        const response = await getServerSideProps({
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