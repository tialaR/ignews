import { render, screen } from '@testing-library/react';
import { Header } from '.';

/* Deixamos o mock no Header pois o componente ActiveLink
(que é um componente utilizado dentro do componente Header) utiliza
esse mock */
jest.mock("next/router", () => {
    return {
      useRouter() {
        return {
          asPath: "/",
        };
      },
    };
});

/* Mocando o next-auth pois essa lib é utilizada dentro do componente SignInButton 
(utilizando o hook useSession) pois ele se encontra dentro do componente de Header */
jest.mock("next-auth/client", () => {
  return {
    useSession() {
      return [null, false] //mocando retorno do useSession
    },
  };
});

describe('Header component', () => {

    it('renders correctly', () => {
        render(
            <Header />
        )

        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('Posts')).toBeInTheDocument()
    });
})