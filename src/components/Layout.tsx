/*

import './globals.css';

export const metadata = {
  title: 'Nordstein Orbit',
  description: 'Dashboard & Vertriebssystem von Nordstein',
  icons: {
    icon: '/favicon.png?v=3',     // dein Nordstein-Icon + Cache-Busting
    shortcut: '/favicon.png?v=3',
    apple: '/favicon.png?v=3',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#fff', color: '#111', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

*/

'use client';

import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Header-Gradient */}
      <div className="bg-gradient-to-b from-[#451a3d] to-white h-[400px] w-full absolute top-0 left-0 z-0" />

      <div className="relative z-10">
        <Navbar />
        <main className="pt-6">{children}</main>
      </div>
    </div>
  );
}
