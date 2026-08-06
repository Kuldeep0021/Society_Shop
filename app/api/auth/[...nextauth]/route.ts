import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isRegister: { label: "Is Register", type: "text" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });

        // Registration logic
        if (credentials.isRegister === 'true') {
          if (user) {
            throw new Error('Email already exists');
          }
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await User.create({
            email: credentials.email,
            password: hashedPassword,
            name: credentials.name || 'Customer',
            role: 'customer'
          });
          return { id: newUser._id.toString(), email: newUser.email, name: newUser.name, role: newUser.role };
        }

        // Seeding the initial admin if it doesn't exist and they try to login with admin/admin123
        if (!user && credentials.email === 'admin@societystore.com' && credentials.password === 'admin123') {
           const hashedPassword = await bcrypt.hash('admin123', 10);
           const newAdmin = await User.create({
             email: 'admin@societystore.com',
             password: hashedPassword,
             name: 'Store Admin',
             role: 'admin'
           });
           return { id: newAdmin._id.toString(), email: newAdmin.email, name: newAdmin.name, role: newAdmin.role };
        }

        // Login logic
        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // If signing in with Google, save them to the DB if they don't exist
      if (account?.provider === 'google') {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'customer'
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Initial sign in
        token.role = (user as any).role || 'customer';
        token.id = user.id;
      }
      // If it's a Google user, we need to fetch their role from the DB
      if (account?.provider === 'google') {
         await connectToDatabase();
         const dbUser = await User.findOne({ email: token.email });
         if (dbUser) {
           token.role = dbUser.role;
           token.id = dbUser._id.toString();
         }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
