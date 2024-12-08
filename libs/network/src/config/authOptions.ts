import { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  AuthProviderType,
  GetAuthProviderDocument,
  LoginDocument,
  RegisterWithProviderDocument,
} from '@autospace/network/src/gql/generated';
import { fetchGraphQL } from '../fetch';

const MAX_AGE = 1 * 24 * 60 * 60;

const secureCookies = process.env.NEXTAUTH_URL?.startsWith('https://')
  ? true
  : false;
// const hostName = new URL(process.env.NEXTAUTH_URL || '').hostname;
const hostName = 'localhost';
const rootDomain = 'sa3akash.com';

export const authOptions: NextAuthConfig = {
  // Configure authentication providers
  providers: [
    // Google OAuth provider configuration
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile',
        },
      },
    }),
    // Credentials provider configuration for email/password authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // Authorize function to validate user credentials
      async authorize(credentials) {
        // Implement credential validation logic
        if (!credentials) {
          throw new Error('Email and password are required');
        }
        const { email, password } = credentials;

        try {
          const { data, error } = await fetchGraphQL({
            document: LoginDocument,
            variables: {
              loginInput: {
                email: email as string,
                password: password as string,
              },
            },
          });

          if (!data?.login.token || error) {
            throw new Error(
              error ||
                'Authentication failed: Invalid credentials or user not found',
            );
          }
          const id = data.login.user.id;
          const image = data.login.user.image;
          const name = data.login.user.name;

          return {
            id,
            name,
            image,
            email: email as string,
            token: data.login.token,
          };
        } catch (error) {
          throw new Error(
            `${error || 'Authentication failed: Invalid credentials or user not found'}`,
          );
        }
      },
    }),
  ],

  // Enable debug mode for development
  //   debug: true,

  // Configure session settings
  session: {
    strategy: 'jwt',
    maxAge: MAX_AGE,
  },

  // Configure JWT settings
  // jwt: {
  //   maxAge: MAX_AGE,
  //   // Custom JWT encoding function
  //   async encode({ token, secret }): Promise<string> {
  //     // Implement custom JWT encoding logic
  //     if (!token) {
  //       throw new Error('Token is undefined');
  //     }
  //     const { sub, ...tokenProps } = token;
  //     // Get the current date in seconds since the epoch
  //     const nowInSeconds = Math.floor(Date.now() / 1000);
  //     // // Calculate the expiration timestamp
  //     const expirationTimestamp = nowInSeconds + MAX_AGE;
  //     const signToken = jwt.sign(
  //       { id: sub, ...tokenProps,exp: expirationTimestamp},
  //       `${secret}`,
  //       {
  //         algorithm: 'HS512',
  //       },
  //     );

  //     console.log('encode',{
  //       signToken,
  //       token,
  //       secret
  //     })

  //     return signToken;
  //   },
  //   // Custom JWT decoding function
  //   async decode({ token, secret }):Promise<JWT | null> {
  //     if (!token) {
  //       throw new Error('Token is undefined');
  //     }
  //     try {

  //       const decodedToken = jwt.verify(token, `${secret}`, {
  //         algorithms: ['HS512'],
  //       });

  //       console.log('decode',{
  //         decodedToken,
  //         token,
  //         secret
  //       })

  //       return decodedToken as JWT
  //     } catch (error) {
  //       console.error('JWT decode error:', error); // Log the error message

  //       return null;
  //     }
  //   },
  // },

  cookies: {
    sessionToken: {
      name: `${secureCookies ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: secureCookies ? 'strict' : 'lax',
        path: '/',
        secure: secureCookies,
        domain: hostName == 'localhost' ? hostName : '.' + rootDomain, // add a . in front so that subdomains are included
      },
    },
  },

  // Configure callback functions
  callbacks: {
    // Sign-in callback
    async signIn({ user, account }) {
      // Implement sign-in logic, e.g., create user in database

      if (account?.provider === 'google') {
        const { id, name, image } = user;

        if (!id || !name || !image) {
          throw new Error('Invalid Google account data');
        }

        const existingUser = await fetchGraphQL({
          document: GetAuthProviderDocument,
          variables: {
            id: '',
            providerAccountId: account.providerAccountId,
          },
        });

        if (!existingUser.data?.getAuthProvider?.id) {
          await fetchGraphQL({
            document: RegisterWithProviderDocument,
            variables: {
              registerWithProviderInput: {
                id: id,
                type: AuthProviderType.Google,
                image,
                name: name || '',
                providerAccountId: account.providerAccountId,
              },
            },
          });
        }
      }

      return true;
    },
    // Session callback
    async session({ token, session }) {
      // Customize session object based on token data
      if (token) {
        session.user = {
          emailVerified: session.user.emailVerified,
          image: token.picture as string,
          id: token.sub as string,
          email: token.email as string,
          name: token.name as string,
          token: token.token as string,
        };
      }
      return session;
    },

    async jwt({ token, user }) {
      return { ...token, ...user };
    },
  },

  // Configure custom pages
  pages: {
    signIn: '/login',
  },
};
