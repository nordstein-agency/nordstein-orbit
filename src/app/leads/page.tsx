'use client';

import { useEffect, useState } from 'react';
// Wenn dieser Import rot ist, nimm die RELATIVE Variante darunter.
import { supabase } from '@/lib/supabase/browser';
//import {adminClient} from "@/lib/supabase/supabaseAdminClient";
//import Layout from '@/components/Layout';
// Alternative (nur falls oben rot ist):
// import { supabase } from '../../lib/supabase/browser';

export default function LeadsPage() {
  const [text, setText] = useState('…prüfe Supabase…');

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      console.log('Supabase getUser()', { data, error });
      if (error) {
        setText('Fehler: ' + error.message);
      } else if (data?.user) {
        setText('Eingeloggt als: ' + (data.user.email || data.user.id));
      } else {
        setText('Kein User eingeloggt');
      }
    }).catch((e) => {
      setText('Unerwarteter Fehler: ' + String(e?.message || e));
    });
  }, []);

  return (
    //<Layout>
    <main style={{ padding: 24 }}>
      <h1>Leads</h1>
      <p>{text}</p>
      <p style={{ marginTop: 12, opacity: 0.7 }}>(Konsole öffnen für Details)</p>
    </main>
    //</Layout>
  );
}
