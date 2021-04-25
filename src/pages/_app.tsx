import { AppProps } from 'next/app';
import { Header } from '../components/Header';
import { Provider as NextAuthProvider } from 'next-auth/client';

import '../styles/global.scss';

function MyApp({ Component, pageProps }: AppProps) {
  //As informações de sessão do next-auth viram através do pageProps (se o usuário está logado ou não)
  return (
    <NextAuthProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthProvider>
  );
  
}

export default MyApp
