import { query as q } from 'faunadb';

import NextAuth from 'next-auth'
import { session } from 'next-auth/client';
import Providers from 'next-auth/providers'

import { fauna } from '../../../services/fauna';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ],
  callbacks: {
    //Callback que permite modificar os dados da session
    async session(session) {

      try {
        //Buscando no BD se o usuário tem uma inscrição ativa ou não
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select( //Selecionando o ref do usuário
                  "ref",
                  q.Get(
                    q.Match( //Buscando usuário por email no banco
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        );
  
        return {
          ...session,
          activeSubscription: userActiveSubscription,
        }; //Retornando a session com os dados modificados
        
      } catch {
        return {
          ...session,
          activeSubscription: null,
        }
      }
    },

    //Login na aplicação usando o NextAuth
    async signIn(user, account, profile) {
      const { email } = user;

      try {
        //Inserindo usário no BD
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create( //Caso o usuário não exista no BD ele será criado
              q.Collection('users'), //Tabela para inserir os dados 
              { data: { email } } //Dados do usuário a serem inseridos
            ),
            q.Get( //Caso contrario recupero as informações dele no BD ou posso atualizar tambem
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        );

        //Retorna true caso o usuário tenha conseguido logar na aplicação 
        return true

      } catch {
        //Retorna false caso o usuário não tenha conseguido logar na aplicação 
        return false;
      }

    },
  }
});