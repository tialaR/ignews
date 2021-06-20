import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/client';
import { mocked } from 'ts-jest/utils';
import { SignInButton } from '.';

/* Mocando o next-auth pois essa lib é utilizada dentro do componente SignInButton */
jest.mock("next-auth/client");

/* SignInButton tem um comportamento diferente p/ quando o usuário está logado
e para quando o usuário não está logado (if else) -> Funcionalidade que é determinada
por meio do retorno do useSession -> quando retorna null é porque o usuário
não está logado, caso contrario é quando ele está logado -> E é isso que será 
realizado nesse teste -> Testar se o componente está retornando as informações 
corretas quando o usuário não está e quando ele está logado*/

describe('SignInButton component', () => {

    it('renders correctly when user is not authenticated', () => {
        /* Dando um funcionamento diferente a função useSession a cada um dos testes
        (mocando o funcionamento da função useSession através da utilização
        da lib ts-jest) */
        const useSessionMocked = mocked(useSession);
        /*Estabelecendo nesse teste q/ o usuário não está logado
        mockReturnValueOnce -> Estabelece que esse mock será valido apenas
        para essa renderização !== do mockReturnValue que estabelece
        que o mock valerá para as proximas renderizações*/
        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<SignInButton />)

        expect(screen.getByText('Sign in with Github')).toBeInTheDocument()
    });

    it('renders correctly when user is authenticated', () => {
        /*Testando usuário logado utilizando a lib ts-jest para mocar o usuário logado*/
        const useSessionMocked = mocked(useSession);
        useSessionMocked.mockReturnValueOnce([
            { user: { name: 'John Doe', email: 'john.doe@example.com' }, expires: 'fake-expires' }, 
            false
        ]);

        render(<SignInButton />)

        expect(screen.getByText('John Doe')).toBeInTheDocument()
    });
})