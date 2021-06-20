
import { fireEvent, render, screen } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/client';
import { mocked } from 'ts-jest/utils';
import { SubscribeButton } from '.';
import { useRouter } from 'next/router';

/* Mocando a parte de autenticação do next */
jest.mock("next-auth/client");

/* Mocando a parte de roteamento do next */
jest.mock("next/router");

describe('SignInButton component', () => {
    it('renders correctly', () => {
        //Estabelecendo q/ o usuário não está logado
        const useSessionMocked = mocked(useSession);
        useSessionMocked.mockReturnValue([null, false]);

        render(<SubscribeButton />)

        expect(screen.getByText('Subscribe now')).toBeInTheDocument()
    });

    it('redirect user to sign when not authenticated', () => {
        /* Criando um mock para a função sign in p/ verificar se essa 
        função foi disparada ou não */

        //Estabelecendo q/ o usuário não está logado
        const useSessionMocked = mocked(useSession);
        useSessionMocked.mockReturnValue([null, false]);

        //Mocando a função signIn utilizando a lib ts-jest
        const signInMocked = mocked(signIn);

        render(<SubscribeButton />)

        //Recuperando botão pelo texto (o elemento será retornado para a const subscribeButton)
        const subscribeButton = screen.getByText('Subscribe now');

        //fireEvent -> função q/ dispara eventos como se fosse um usuário (simulando click)
        fireEvent.click(subscribeButton)

        /* Espero q/ o usuário seja redirecionado p/ a página de signIn
        -> para isso vou validar se a função signIn foi chamada */
        expect(signInMocked).toHaveBeenCalled();
    })

    /*Testa o redirecionamento do usuário p/ a tela de posts quando ele já tem 
    uma subscription ativa */
    it('redirects to posts when user already has a subscription', () => {
        //Mocando a useRouter do next/router
        const useRouterMocked = mocked(useRouter);

        //Mocando useSession do next-auth/client
        const useSessionMocked = mocked(useSession);

        //Mocando função push que vem de dentro de useRouter
        const pushMock = jest.fn();

        /*Estabelecendo que quando o usuário chamar o useSession ele vai retornar
        um usuário como se estivesse logado */
        useSessionMocked.mockReturnValueOnce([
            { user: 
                { 
                    name: 'John Doe', 
                    email: 'john.doe@example.com' 
                }, 
                //simulando o if(session.activeSubscription) 
                activeSubscription: 'fake-active-subscription',
                expires: 'fake-expires' 
            }, 
            false
        ]);

        /*Estabelecendo que quando a função useRouter for chamada 
        o retorno da proxima vez q ela for chamada vai ser uma função push */
        useRouterMocked.mockReturnValueOnce({
            push: pushMock,
        }as  any)

        render(<SubscribeButton />)

        const subscribeButton = screen.getByText('Subscribe now');
        
        fireEvent.click(subscribeButton);

        /*Verficando se a fução pushMock foi chamada com o parâmetro /posts
        quando o  if(session.activeSubscription) for true*/
        expect(pushMock).toHaveBeenCalledWith('/posts');
    })
})