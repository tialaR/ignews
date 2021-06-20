module.exports = {
    /*Pastas que eu quero ignorar nos testes 
    (ignorar as pastas onde contenham códigos que eu não dou manutenção)*/
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],

    /*Array de arquivos que eu quero que o jest execute antes de executar os testes*/
    setupFilesAfterEnv: [
        "<rootDir>/src/tests/setupTests.ts"
    ],
    
    /*Funciona da mesma forma como funcionam os loaders dentro do webpack
    (esécifica que em arquivos de algumas extensões eu vou transformar o 
    código desse arquivo de alguma ação antes de executar os códigos)
    -> Isso porque os arquivos q/ estão escritos em typeScript eu preciso converter
    eles com o babel para alguma maneira que o Jest consiga entender esses arquivos
    <rootDir> -> Simboliza a pasta root do projeto nos arquivos de configuração do jest
    (raiz do projeto)
    node_modules/babel-jest -> módulo que transforma o código typescript p/
    uma maneira que o jest consiga entender.*/
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest"
    },

    /* Config para lidar com css module no jest, utilizando a lib identity-obj-proxy 
    Essa lib vai fazer o parse dos arquivos para que arquivos que utilizam estilos 
    com essas extensões possam realizar os testes no jest*/
    moduleNameMapper: {
        "\\.(scss|css|sass)$": "identity-obj-proxy"
    },

    /* Indicando em que ambiente os nossos testes estão execurando para saber
    como é que o jest vai se comportar na hora de criar o HTML ou criar o que ele
    precisa. -> O ambiente perfeito que ele precisa para realmente simular a nossa
    aplicação e conseguir testar os componentes e os elementos que estão alí dentro.
    jsdom -> É uma forma nativa de fazer isso (vem de forma nativa com o jest) 
    -> O que ele faz é: Quando estamos renderizando um html 
    (que é basicamente o que vamos testar) ele vai criar 
    uma representação da dom em javascript (no formato de objeto ou de array) 
    para conseguir entender o que foi renderizado em tela e o que não foi.*/
    testEnvironment: 'jsdom',
};