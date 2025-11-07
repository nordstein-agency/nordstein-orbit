import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Nordstein Orbit</h1>
      <p>It works 🎉</p>
      <p><Link href="/ping">→ Zur Ping-Seite</Link></p>
      <p><Link href="/leads">→ Zur Leads-Seite</Link></p>
    </main>
  );
}
