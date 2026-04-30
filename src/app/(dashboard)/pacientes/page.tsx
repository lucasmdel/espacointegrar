'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Paciente, Aplicacao } from '@/types'

export default function PacientesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // form state
  const [mpNome, setMpNome] = useState('')
  const [mpIdade, setMpIdade] = useState('')
  const [mpSexo, setMpSexo] = useState('')
  const [mpEmail, setMpEmail] = useState('')
  const [mpObs, setMpObs] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: pacs }, { data: apps }] = await Promise.all([
      supabase.from('pacientes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('aplicacoes').select('id, paciente_id').eq('user_id', user.id),
    ])
    setPacientes(pacs ?? [])
    setAplicacoes(apps ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function salvar() {
    if (!mpNome.trim()) { alert('Informe o nome do paciente.'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('pacientes').insert({
      user_id: user.id,
      nome: mpNome.trim(),
      idade: mpIdade ? parseInt(mpIdade) : null,
      sexo: mpSexo || null,
      email: mpEmail || null,
      obs: mpObs || null,
    })
    setMpNome(''); setMpIdade(''); setMpSexo(''); setMpEmail(''); setMpObs('')
    setModalOpen(false)
    setSaving(false)
    await load()
  }

  const lista = pacientes.filter(p => p.nome.toLowerCase().includes(filtro.toLowerCase()))

  if (loading) return <div className="loading">Carregando…</div>

  return (
    <>
      <div className="page-header">
        <h2>Pacientes</h2>
        <p>Cadastre e gerencie os pacientes em monitoramento.</p>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar paciente…" value={filtro} onChange={e => setFiltro(e.target.value)} />
        </div>
        <button className="btn btn-blue" onClick={() => setModalOpen(true)}>+ Novo paciente</button>
      </div>

      <div className="data-table">
        <div className="table-head pac-cols">
          <div>Nome</div><div>Idade</div><div>Aplicações</div><div>Último teste</div><div>Ação</div>
        </div>
        {lista.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            {filtro ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda.'}
          </div>
        ) : (
          lista.map(p => {
            const apps = aplicacoes.filter(a => a.paciente_id === p.id)
            return (
              <div className="table-row pac-cols" key={p.id}>
                <div className="cell-name">
                  <div className="av">{p.nome.charAt(0)}</div>
                  {p.nome}
                </div>
                <div className="cell">{p.idade ?? '—'}</div>
                <div className="cell">{apps.length}</div>
                <div className="cell">—</div>
                <div>
                  <button
                    className="btn btn-blue btn-sm"
                    onClick={() => router.push(`/aplicar/srq?pacId=${p.id}&nome=${encodeURIComponent(p.nome)}&idade=${p.idade ?? ''}&sexo=${encodeURIComponent(p.sexo ?? '')}`)}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      <div className={`overlay ${modalOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
        <div className="modal">
          <div className="modal-title">Novo paciente</div>
          <div className="modal-sub">Preencha os dados básicos para cadastrar no sistema.</div>
          <div className="modal-grid">
            <div className="ff modal-full">
              <label>Nome completo</label>
              <input type="text" value={mpNome} onChange={e => setMpNome(e.target.value)} placeholder="Nome do paciente" />
            </div>
            <div className="ff">
              <label>Idade</label>
              <input type="number" value={mpIdade} onChange={e => setMpIdade(e.target.value)} placeholder="Ex: 28" min={1} max={120} />
            </div>
            <div className="ff">
              <label>Sexo</label>
              <select value={mpSexo} onChange={e => setMpSexo(e.target.value)}>
                <option value="">Selecione</option>
                <option>Feminino</option>
                <option>Masculino</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="ff modal-full">
              <label>E-mail (opcional)</label>
              <input type="email" value={mpEmail} onChange={e => setMpEmail(e.target.value)} placeholder="paciente@email.com" />
            </div>
            <div className="ff modal-full">
              <label>Observações (opcional)</label>
              <input type="text" value={mpObs} onChange={e => setMpObs(e.target.value)} placeholder="Ex: encaminhado por médico" />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-blue" onClick={salvar} disabled={saving}>
              {saving ? 'Salvando…' : 'Cadastrar paciente'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
