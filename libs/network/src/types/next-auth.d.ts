import NextAuth, { type DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// declare module 'next-auth' {
//   interface Session {
//     user: {
//       email: string;
//       token: string;
//     } & DefaultSession['user'];
//   }

//   interface User {
//     id: string;
//     name: string;
//     image?: string;
//     email?: string;
//     token: string;
//   }
// }

import NextAuth from 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';

// Extend NextAuth's User and session types
declare module 'next-auth' {
  interface Session {
    user: {
      email: string;
      token: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    token: string;
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    token?: string;
  }
}
