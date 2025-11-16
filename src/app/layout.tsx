import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Nordstein Orbit",
  description: "Vertriebssystem mit Supabase und Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen relative overflow-x-hidden bg-black">

        {/* ======= PERFORMANTER ORBIT TEST-BACKGROUND ======= */}
        <div className="absolute inset-0 -z-50">
          {/* Nur ein EINZIGER, super schneller Layer */}
          <div className="
            absolute inset-0 
            bg-gradient-to-b 
            from-[#301226] via-[#1a0f17] to-black
          " />
        </div>

        {/* ======= CONTENT ======= */}
        <div className="relative z-10">
          <Navbar />
          <main className="pt-24">{children}</main>
        </div>

      </body>
    </html>
  );
}
