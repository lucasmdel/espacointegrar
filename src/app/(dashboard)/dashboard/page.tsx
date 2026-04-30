'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Aplicacao, Paciente, Profile } from '@/types'

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([])
  const [totalPacs, setTotalPacs] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: apps }, { count }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('aplicacoes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      setProfile(prof)
      setAplicacoes(apps ?? [])
      setTotalPacs(count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const totalClinicos = aplicacoes.filter(a => a.clinico).length
  const recentes = aplicacoes.slice(0, 5)

  if (loading) return <div className="loading">Carregando…</div>

  return (
    <>
      <div className="page-header">
        <h2>{saudacao}{profile ? `, ${profile.nome.split(' ')[0]}` : ''}</h2>
        <p>Sistema de monitoramento de alvo de pacientes em psicoterapia.</p>
      </div>

      <div className="metrics">
        <div className="metric-card blue">
          <div className="metric-label">Total de aplicações</div>
          <div className="metric-value">{aplicacoes.length}</div>
          <div className="metric-sub">testes realizados</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pacientes cadastrados</div>
          <div className="metric-value">{totalPacs}</div>
          <div className="metric-sub">no sistema</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Indicativo clínico</div>
          <div className="metric-value">{totalClinicos}</div>
          <div className="metric-sub">resultado clínico</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Instrumentos ativos</div>
          <div className="metric-value">1</div>
          <div className="metric-sub">SRQ-20 disponível</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Últimas aplicações</div>
            <Link href="/historico" className="card-action">Ver todas →</Link>
          </div>
          {recentes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              Nenhuma aplicação realizada ainda.<br />
              Clique em &quot;Nova aplicação&quot; para começar.
            </div>
          ) : (
            recentes.map(a => (
              <div className="activity-row" key={a.id}>
                <div className="av">{a.nome_paciente.charAt(0)}</div>
                <div className="act-info">
                  <div className="act-name">{a.nome_paciente}</div>
                  <div className="act-meta">
                    SRQ-20 · {a.score}/20 · {new Date(a.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <span className={`badge ${a.clinico ? 'badge-clinico' : 'badge-ok'}`}>
                  {a.clinico ? 'Clínico' : 'Não clínico'}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Instrumentos</div></div>
          <div className="activity-row">
            <div className="av" style={{ fontSize: 11, fontWeight: 700 }}>SRQ</div>
            <div className="act-info">
              <div className="act-name">SRQ-20</div>
              <div className="act-meta">Saúde mental · 20 itens</div>
            </div>
            <span className="badge badge-ativo">Ativo</span>
          </div>
          <div className="activity-row" style={{ opacity: 0.5 }}>
            <div className="av" style={{ fontSize: 11, fontWeight: 700, background: 'var(--gray-100)', color: 'var(--gray-500)' }}>PHQ</div>
            <div className="act-info">
              <div className="act-name">PHQ-9</div>
              <div className="act-meta">Depressão · 9 itens</div>
            </div>
            <span className="badge badge-soon">Em breve</span>
          </div>
          <div className="activity-row" style={{ opacity: 0.5 }}>
            <div className="av" style={{ fontSize: 11, fontWeight: 700, background: 'var(--gray-100)', color: 'var(--gray-500)' }}>GAD</div>
            <div className="act-info">
              <div className="act-name">GAD-7</div>
              <div className="act-meta">Ansiedade · 7 itens</div>
            </div>
            <span className="badge badge-soon">Em breve</span>
          </div>
        </div>
      </div>
    </>
  )
}
