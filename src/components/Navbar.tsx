'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/browser'

const ROLE_FULL_ACCESS = 'full_access'
const ROLE_PARTNER_AGENCY = 'partner_agency'
const ROLE_GUEST = 'guest'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>(ROLE_GUEST)

  // 🔹 Benutzerrolle prüfen
  const checkUserRole = useCallback(async (email?: string | null) => {
    console.log('Checking role for email:', email)
    if (!email) return ROLE_GUEST
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .maybeSingle()

      console.log('Role query result:', data?.role, error)
    if (error || !data?.role) return ROLE_GUEST
    const role = data.role.toLowerCase()
    if (role === 'partner') return ROLE_PARTNER_AGENCY
    return ROLE_FULL_ACCESS
  }, [])

  // 🔹 Auth-Zustand & Rolle beobachten
  useEffect(() => {
  const fetchAndCheckUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    const authUser = data?.user || null
    setUser(authUser)

    if (!authUser?.email) {
      setUserRole(ROLE_GUEST)
      return
    }

    console.log('🔹 Prüfe Rolle für:', authUser.email)

    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('email', authUser.email)
      .maybeSingle()

    console.log('🔹 Ergebnis:', userData, roleError)

    if (roleError || !userData?.role) {
      setUserRole(ROLE_GUEST)
    } else if (userData.role.toLowerCase() === 'partner') {
      setUserRole(ROLE_PARTNER_AGENCY)
    } else {
      setUserRole(ROLE_FULL_ACCESS)
    }
  }

  // beim ersten Render prüfen
  fetchAndCheckUser()

  // bei Auth-Änderung erneut prüfen
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setUser(session.user)
      fetchAndCheckUser()
    } else {
      setUser(null)
      setUserRole(ROLE_GUEST)
    }
  })

  return () => subscription.unsubscribe()
}, [])


  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // 🔹 Navigation nach Rolle rendern
  const renderNavLinks = () => {

    console.log('Rendering nav links for role:', userRole)

    if (userRole === ROLE_FULL_ACCESS) {
      return (
        <div className="flex items-center gap-8">
          <Link href="/leads" className="nav-link">
            Leads
          </Link>
          <Link href="/customers" className="nav-link">
            Kunden
          </Link>
          <Link href="/contracts" className="nav-link">
            Verträge
          </Link>

          <div className="relative group">
            <Link href="/projects" className="nav-link">
              Projekte
            </Link>
            <div className="absolute left-0 mt-2 w-52 bg-white shadow-lg border border-[#d9c8d5]
                            z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible
                            transition-opacity duration-200 ease-out">
              <Link
                href="/projects"
                className="block px-4 py-2 text-center text-[#451a3d] no-underline
                           hover:bg-[#f9f7f8] hover:text-[#6b3c67] transition-all"
              >
                Projekte
              </Link>
              <div className="border-t border-[#d9c8d5]" />
              <Link
                href="/offer-calculator"
                className="block px-4 py-2 text-center text-[#451a3d] no-underline
                           hover:bg-[#f9f7f8] hover:text-[#6b3c67] transition-all"
              >
                Angebotsrechner
              </Link>
            </div>
          </div>

          <div className="relative group">
            <Link href="/profile" className="nav-link">
              Profil
            </Link>
            <div className="absolute left-0 mt-2 w-52 bg-white shadow-lg border border-[#d9c8d5]
                            z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible
                            transition-opacity duration-200 ease-out">
              <Link
                href="/profile"
                className="block px-4 py-2 text-center text-[#451a3d] hover:bg-[#f9f7f8] hover:text-[#6b3c67]"
              >
                Profil
              </Link>
              <div className="border-t border-[#d9c8d5]" />
              <Link
                href="/commission-invoices"
                className="block px-4 py-2 text-center text-[#451a3d] hover:bg-[#f9f7f8] hover:text-[#6b3c67]"
              >
                Abrechnungen
              </Link>
            </div>
          </div>

          <div className="relative group">
            <Link href="/career" className="nav-link">
              Karriere
            </Link>
            <div className="absolute left-0 mt-2 w-52 bg-white shadow-lg border border-[#d9c8d5]
                            z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible
                            transition-opacity duration-200 ease-out">
              <Link
                href="/career"
                className="block px-4 py-2 text-center text-[#451a3d] hover:bg-[#f9f7f8] hover:text-[#6b3c67]"
              >
                Karriere
              </Link>
              <div className="border-t border-[#d9c8d5]" />
              <Link
                href="/leaderboard"
                className="block px-4 py-2 text-center text-[#451a3d] hover:bg-[#f9f7f8] hover:text-[#6b3c67]"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      )
    }

    if (userRole === ROLE_PARTNER_AGENCY) {
      return (
        <div className="flex items-center gap-8">
          <Link href="/leads" className="nav-link">
            Leads
          </Link>
          <Link href="/projects" className="nav-link">
            Projekte
          </Link>
          <Link href="/profile" className="nav-link">
            Profil
          </Link>
        </div>
      )
    }

    return null
  }

  return (
    <header className="relative w-full">
      <nav className="max-w-6xl mx-auto flex items-center justify-between py-6 px-8">
        {/* Logo links */}
        <span className="nav-link font-bold tracking-wider cursor-default">
          NORDSTEIN ORBIT
        </span>

        {/* Navigation zentriert (horizontal) */}
        {user && renderNavLinks()}

        {/* Logout rechts */}
        {user && (
          <a
            href="#"
            onClick={handleLogout}
            className="nav-link text-sm font-medium ml-6"
          >
            Abmelden
          </a>
        )}
      </nav>
    </header>
  )
}
