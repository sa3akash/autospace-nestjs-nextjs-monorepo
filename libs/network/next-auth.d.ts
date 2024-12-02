import NextAuth, { type DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      email: string;
      token: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    name: string;
    image?: string;
    email?: string;
    token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    token?: string;
  }
}
