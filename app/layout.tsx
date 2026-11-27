import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { LibraryProvider } from '../context/LibraryContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ToastContainer } from '../components/Toast';
import { createClient } from '../lib/supabase/server';
import { fetchProfile } from '../lib/profile';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "Biblioteca Coletivo Negro Viegas D'Abreu",
  description:
    "Sistema de gestão, consulta e circulação de livros da Biblioteca Comunitária do Coletivo Negro Viegas D'Abreu.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const initialUser = user ? await fetchProfile(supabase, user.id) : null;

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased overscroll-y-none`}
    >
      <body className="min-h-full flex flex-col bg-coletivo-pattern text-[#F2EDE3] font-sans overscroll-y-none selection:bg-[#9B2915] selection:text-white">
        <AuthProvider initialUser={initialUser}>
          <LibraryProvider>
            <div className="relative z-10 min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </div>
            <ToastContainer />
          </LibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}