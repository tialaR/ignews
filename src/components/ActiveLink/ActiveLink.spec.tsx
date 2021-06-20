/*render -> Vai renderizar o componente de uma maneira virtual, ou seja, vai renderizar 
de uma forma que consigamos ver qual que é o output de um componente */
import { render, screen } from "@testing-library/react";
import { ActiveLink } from "./index";

/*Mocando o 'next/router'
-> Estabelecendo que toda vez que o componente importar o next-router ele
vai ter determinado retorno 
-> Essa configuração eu posso fazer com qualquer módulo (arquivos dentro da pasta
node_modules ou com arquivos locais do app)*/
jest.mock("next/router", () => {
    return {
      useRouter() {
        return {
          asPath: "/",
        };
      },
    };
});

/*describe -> Serve para categorizar os testes (especificar
    qual componente estamos testando com determinado teste deixando 
    o log mais organizado) */
describe('ActiveLink component', () => {

    it('renders correctly', () => {
        render(
            <ActiveLink href="/" activeClassName="active">
                <a>Home</a>
            </ActiveLink>
        )
    
        /*Funciona como um console.log() => Mostra também o html
        virtual que o componente gerou na tela para o código do componente testado */
        //debug()
    
        /* O que espero na execução dos testes */
        expect(screen.getByText('Home')).toBeInTheDocument()
    });
    
    /*Testando se o componente activelink está recebendo a classe
    active quando ele estiver ativo*/
    it('add active class if the link as currently active', () => {
        render(
            <ActiveLink href="/" activeClassName="active">
                <a>Home</a>
            </ActiveLink>
        )
    
        expect(screen.getByText('Home')).toHaveClass('active')
    });
})