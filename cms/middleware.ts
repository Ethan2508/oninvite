import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    // Protéger toutes les pages sauf login, api/auth, et fichiers statiques
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
