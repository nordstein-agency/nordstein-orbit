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

        {/* --- ORBIT BACKGROUND WRAPPER (absolute statt fixed, aber optisch identisch!) --- */}
        <div className="absolute inset-0 -z-50">

          {/* --- ORBIT GRADIENT BASE LAYER (EXAKT WIE VORHER) --- */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#451a3d]/90 via-[#1a0f17]/70 to-black" />

          {/* --- SOFT ORBIT GLOW (EXAKT WIE VORHER) --- */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[#451a3d]/40 blur-[180px]" />

          {/* --- LOW NOISE TEXTURE (EXAKT WIE VORHER) --- */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-soft-light bg-[url('/noise.png')]" />

          {/* --- ENERGY SWIRLS (EXAKT WIE VORHER) --- */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              className="w-full h-full opacity-[0.15]"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <radialGradient id="orbit-line" cx="50%" cy="50%" r="75%">
                  <stop offset="0%" stopColor="#6d3662" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <circle cx="40%" cy="35%" r="60%" fill="url(#orbit-line)" />
              <circle cx="60%" cy="65%" r="50%" fill="url(#orbit-line)" />
            </svg>
          </div>

        </div>

        {/* --- ACTUAL CONTENT (Navbar + Pages) --- */}
        <div className="relative z-10">
          <Navbar />
          <main className="pt-6">{children}</main>
        </div>

      </body>
    </html>
  );
}
