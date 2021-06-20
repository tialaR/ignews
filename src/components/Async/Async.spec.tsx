import { render, screen, waitFor } from '@testing-library/react';
import { Async } from '.';

/* Testes de forma assíncrona usando o testing-library */
test('it renders correclty', async () => {
    render(<Async />)

    /* Os métodos que começam com get no jest não esperam eventos acontecerem
    (utilizado p/ eventos não assíncronos) */
    expect(screen.getByText('Hello World')).toBeInTheDocument()

    /* Os métodos que começam com find do Jest esperam algum componente aparecer em tela 
    (eventos assíncronos) por isso preciso usar o asyn await pois ele retorna uma promise */
    //expect(await screen.findByText('Button')).toBeInTheDocument()

    /* O método waitFor espera algo acontecer (eventos assincronos)
    que não é necessáriamente a aparição de um componente na tela */
    await waitFor(() => {
        //O código será executado várias vezes até que o expect passe
        return expect(screen.getByText('Button')).toBeInTheDocument()
    })
})

/*
    Existem 3 tipos de métodos q/ podemos usar:
    get -> Os q/ começam com get vão procurar os elementos de forma sincrona e se não
    encontrar ele vai dar erro
    query -> Procura pelo elemento de forma sincrona e se não encontrar não da erro
    find -> Procura o elemento de forma assíncrona e se não encontrar vai da erro
*/