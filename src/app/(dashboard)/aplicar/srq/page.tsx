'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { SRQ_QUESTIONS, SRQ_CUTOFF } from '@/lib/srq'

function SRQForm() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')
  const [sexo, setSexo] = useState('')
  const [resps, setResps] = useState<(0 | 1 | null)[]>(new Array(20).fill(null))
  const [pag, setPag] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.get('nome')) setNome(decodeURIComponent(params.get('nome')!))
    if (params.get('idade')) setIdade(params.get('idade')!)
    if (params.get('sexo')) setSexo(decodeURIComponent(params.get('sexo')!))
  }, [])

  const pacId = params.get('pacId')
  const ini = pag * 5
  const fim = Math.min(ini + 5, 20)
  const totalRespondidas = resps.filter(r => r !== null).length
  const pct = Math.round((totalRespondidas / 20) * 100)
  const isUltima = fim >= 20

  function responder(i: number, v: 0 | 1) {
    setResps(prev => { const n = [...prev]; n[i] = v; return n })
  }

  function avancar() {
    if (resps.slice(ini, fim).some(r => r === null)) {
      alert('Responda todas as questões desta página antes de continuar.')
      return
    }
    if (isUltima) { finalizar(); return }
    setPag(p => p + 1)
  }

  async function finalizar() {
    if (resps.some(r => r === null)) {
      alert('Existem questões sem resposta. Revise todas as páginas.')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const score = (resps as number[]).reduce((a, b) => a + b, 0)
    const clinico = score >= SRQ_CUTOFF

    const { data, error } = await supabase.from('aplicacoes').insert({
      user_id: user.id,
      paciente_id: pacId || null,
      instrumento: 'SRQ-20',
      score,
      clinico,
      respostas: resps,
      nome_paciente: nome || 'Não informado',
      idade_paciente: idade ? parseInt(idade) : null,
      sexo_paciente: sexo || null,
    }).select().single()

    if (error || !data) { alert('Erro ao salvar. Tente novamente.'); setSaving(false); return }
    router.push(`/resultado/${data.id}`)
  }

  return (
    <div className="srq-container">
      <button className="breadcrumb" onClick={() => router.push('/aplicar')}>
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Instrumentos
      </button>

      <div className="srq-title">SRQ-20</div>
      <div className="srq-subtitle">Preencha os dados do respondente e responda as questões.</div>

      <div className="dados-box">
        <h3>Dados do respondente</h3>
        <div className="form-grid3">
          <div className="ff">
            <label>Nome completo</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do paciente" />
          </div>
          <div className="ff">
            <label>Idade</label>
            <input type="number" value={idade} onChange={e => setIdade(e.target.value)} placeholder="Ex: 34" min={1} max={120} />
          </div>
          <div className="ff">
            <label>Sexo</label>
            <select value={sexo} onChange={e => setSexo(e.target.value)}>
              <option value="">Selecione</option>
              <option>Feminino</option>
              <option>Masculino</option>
              <option>Outro / Prefiro não informar</option>
            </select>
          </div>
        </div>
      </div>

      <div className="prog-label">
        <span>Questão {ini + 1}–{fim} de 20</span>
        <span>{pct}% respondido</span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${pct}%` }} />
      </div>

      {SRQ_QUESTIONS.slice(ini, fim).map((q, idx) => {
        const i = ini + idx
        const r = resps[i]
        return (
          <div className={`q-card ${r !== null ? 'answered' : ''}`} key={i}>
            <div className="q-n">Questão {i + 1} de 20</div>
            <div className="q-t">{q}</div>
            <div className="q-opts">
              <button className={`q-opt ${r === 1 ? 'sim' : ''}`} onClick={() => responder(i, 1)}>Sim</button>
              <button className={`q-opt ${r === 0 ? 'nao' : ''}`} onClick={() => responder(i, 0)}>Não</button>
            </div>
          </div>
        )
      })}

      <div className="srq-nav">
        <button className="btn" onClick={() => setPag(p => p - 1)} style={{ visibility: pag === 0 ? 'hidden' : 'visible' }}>
          ← Anterior
        </button>
        <span className="srq-nav-info">Página {pag + 1} de 4</span>
        <button className="btn btn-blue" onClick={avancar} disabled={saving}>
          {saving ? 'Salvando…' : isUltima ? 'Ver resultado' : 'Próximo →'}
        </button>
      </div>
    </div>
  )
}

export default function SRQPage() {
  return (
    <Suspense fallback={<div className="loading">Carregando…</div>}>
      <SRQForm />
    </Suspense>
  )
}
