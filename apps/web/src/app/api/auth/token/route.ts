import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const getCookies = cookies();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Use the appropriate cookie name based on the environment
  const cookieName = isDevelopment
    ? 'next-auth.session-token'
    : '__Secure-next-auth.session-token';

  const nextAuthSession = (await getCookies).get(cookieName)?.value || '';

  return NextResponse.json(nextAuthSession);
}
