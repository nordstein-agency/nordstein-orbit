'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  useEffect(() => {
    ;(async () => {
      const { error } = await supabase.auth.getUser()
      console.log('Supabase Verbindung:', { error, hasClient: !!supabase })
    })()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Test</h1>
      <p>Öffne die Browser-Konsole (Rechtsklick → Untersuchen → Konsole).</p>
    </div>
  )
}
