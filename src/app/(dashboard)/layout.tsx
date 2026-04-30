'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types'

const NAV = [
  {
    href: '/dashboard', label: 'Dashboard',
    icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  },
  {
    href: '/pacientes', label: 'Pacientes',
    icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  },
  {
    href: '/aplicar', label: 'Aplicar teste',
    icon: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  },
  {
    href: '/historico', label: 'Histórico',
    icon: <><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></>,
  },
]

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pacientes': 'Pacientes',
  '/aplicar': 'Aplicar instrumento',
  '/historico': 'Histórico',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Espaço Integrar'
  const initials = profile?.nome?.charAt(0).toUpperCase() ?? '?'
  const shortName = profile?.nome?.split(' ').slice(0, 2).join(' ') ?? '…'

  return (
    <div style={{ display: 'flex' }}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Image src="/logo.png" alt="Espaço Integrar" width={120} height={32} style={{ height: 32, width: 'auto', filter: 'brightness(0) invert(1)' }} />
          <div>
            <div className="logo-sub-text">Monitoramento de Alvo</div>
          </div>
        </div>

        <div className="nav-section">Menu</div>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard') ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24">{item.icon}</svg>
            </span>
            {item.label}
          </Link>
        ))}

        <div className="sidebar-footer">
          <div className="user-block">
            <div className="user-av">{initials}</div>
            <div>
              <div className="user-name">{shortName}</div>
              <div className="user-crp">{profile?.crp ?? 'Sistema interno'}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>Sair da conta</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-title">{title}</div>
          <Link href="/aplicar">
            <button className="btn btn-blue">+ Nova aplicação</button>
          </Link>
        </div>
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  )
}
