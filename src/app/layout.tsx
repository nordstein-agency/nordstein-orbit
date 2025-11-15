import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Nordstein Orbit',
  description: 'Vertriebssystem mit Supabase und Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-red-500 relative overflow-x-hidden">

        {/* 💜 Orbit-Gradient (FEST FIXIERT, IMMER SICHTBAR!) */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#451a3d] to-black -z-10" />

        {/* Inhalt */}
        <div className="relative z-20">
          <Navbar />
          <main className="pt-6">{children}</main>
        </div>

      </body>
    </html>
  );
}
