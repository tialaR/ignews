import { render, screen } from '@testing-library/react';
import { stripe } from '../../services/stripe';
import Home, { getStaticProps } from '../../pages';
import { mocked } from 'ts-jest/utils';

/* Mocando a parte de rotas do next */
jest.mock('next/router')

/* Mocando a parte de autenticação do next */
jest.mock('next-auth/client', () => {
    return {
      useSession: () => [null, false]
    }
})

/* Mocando a parte de roteamento do next */
jest.mock("next/router");

/* Mocando o Stripe */
jest.mock('../../services/stripe')

describe('Home page', () => {
    it('renders correctly', () => {

        render(<Home product={{ priceId: 'fake-price-id', amount: '$10.00' }} />)

        expect(screen.getByText('for $10.00 month')).toBeInTheDocument()
    })

    /* Testando o getStaticProps (testando se a página está carregando os dados iniciais) */
    it('loads initial data', async () => {
        /* Mocando a função prices.retrieve do stripe */
        const stripePricesRetrieveMocked = mocked(stripe.prices.retrieve)

        /*Estabelecendo q/ toda vez q eu chamar a função prices.retrieve do stripe
        eu vou mocar o retorno dela
        prices.retrieve -> Retorna uma promise
        mockResolvedValueOnce -> Sempre q a função for uma promise eu uso o mockResolvedValueOnce*/
        stripePricesRetrieveMocked.mockResolvedValueOnce({
            id: 'fake-price-id',
            unit_amount: 1000
        } as any)

        const response = await getStaticProps({})

        /*Verifica se o objeto conterá as informações esperadas*/
        expect(response).toEqual(
            expect.objectContaining({
              props: {
                product: {
                  priceId: 'fake-price-id',
                  amount: '$10.00'
                }
              }
            })
        )
    })
})