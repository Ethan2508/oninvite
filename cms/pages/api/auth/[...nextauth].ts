import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        // Vérification des credentials via variables d'environnement
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@oninvite.fr';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Oninvite2026!';

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return {
            id: '1',
            name: 'Admin Oninvite',
            email: adminEmail,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 heures
  },
  secret: process.env.NEXTAUTH_SECRET || 'oninvite-secret-key-2026',
});
