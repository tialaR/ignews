import { render, screen } from '@testing-library/react';
import Posts, { getStaticProps } from '../../pages/posts';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';

const posts = [
    {
      slug: 'my-new-post',
      title: 'My New Post',
      excerpt: 'Post excerpt',
      updatedAt: '10 de Abril'
    }
  ]

/* Mocando o prismic */
jest.mock('../../services/prismic');

describe('Posts page', () => {
    it('renders correctly', () => {

        render(<Posts posts={posts} />)

        expect(screen.getByText('My New Post')).toBeInTheDocument()
    })

    /* Testando o getStaticProps (testando se a página está carregando os dados iniciais) */
    it('loads initial data', async () => {
        /* Mocando a função getPrismicClient do prismic */
        const getPrismicClientMocked = mocked(getPrismicClient)

        /*Estabelecendo q/ toda vez q eu chamar a função getPrismicClient do prismic
        eu vou mocar o retorno dela
        prices.retrieve -> Retorna uma promise
        mockResolvedValueOnce -> Sempre q a função for uma promise eu uso o mockResolvedValueOnce*/
        getPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
              results: [
                {
                  uid: 'my-new-post',
                  data: {
                    title: [
                      { title: 'heading', text: 'My New Post'}
                    ],
                    content: [
                      { type: 'paragraph', text: 'Post excerpt' }
                    ],
                  },
                  last_publication_date: '04-01-2021'
                }
              ]
            })
          }as any)

        const response = await getStaticProps({})

        /*Verifica se o objeto conterá as informações esperadas*/
        expect(response).toEqual(
            expect.objectContaining({
              props: {
                posts: [{
                  slug: 'my-new-post',
                  title: 'My New Post',
                  excerpt: 'Post excerpt',
                  updatedAt: '01 de abril de 2021'
                }]
              }
            })
          )
    })
})