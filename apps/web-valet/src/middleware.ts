import { auth as middleware } from '@autospace/network/src/config/auth';

export default middleware((req) => {
  const isAuthenticated = !!req.auth;

  console.log({ isAuthenticated });

  // if (!isAuthenticated) {
  //   const newUrl = new URL("/signin", req.nextUrl.origin);
  //   return Response.redirect(newUrl);
  // }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
