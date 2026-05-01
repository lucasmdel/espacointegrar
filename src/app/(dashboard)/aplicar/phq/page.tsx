'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { PHQ_QUESTIONS, PHQ_OPTIONS, phqSeveridade } from '@/lib/phq'

function PHQForm() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')
  const [sexo, setSexo] = useState('')
  const [resps, setResps] = useState<(number | null)[]>(new Array(9).fill(null))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.get('nome'))  setNome(decodeURIComponent(params.get('nome')!))
    if (params.get('idade')) setIdade(params.get('idade')!)
    if (params.get('sexo'))  setSexo(decodeURIComponent(params.get('sexo')!))
  }, [])

  const pacId = params.get('pacId')
  const totalRespondidas = resps.filter(r => r !== null).length
  const pct = Math.round((totalRespondidas / 9) * 100)

  function responder(i: number, v: number) {
    setResps(prev => { const n = [...prev]; n[i] = v; return n })
  }

  async function finalizar() {
    if (resps.some(r => r === null)) {
      alert('Responda todas as questões antes de continuar.')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const score = (resps as number[]).reduce((a, b) => a + b, 0)
    const { clinico } = phqSeveridade(score)

    const { data, error } = await supabase.from('aplicacoes').insert({
      user_id: user.id,
      paciente_id: pacId || null,
      instrumento: 'PHQ-9',
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
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        Instrumentos
      </button>

      <div className="srq-title">PHQ-9</div>
      <div className="srq-subtitle">
        Durante as últimas 2 semanas, com que frequência você foi incomodado(a) pelos problemas abaixo?
      </div>

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
        <span>9 questões · escala de frequência</span>
        <span>{pct}% respondido</span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${pct}%` }} />
      </div>

      {PHQ_QUESTIONS.map((q, i) => {
        const r = resps[i]
        return (
          <div className={`q-card ${r !== null ? 'answered' : ''}`} key={i}>
            <div className="q-n">Questão {i + 1} de 9</div>
            <div className="q-t">{q}</div>
            <div className="q-opts phq-opts">
              {PHQ_OPTIONS.map(opt => (
                <button
                  key={opt.valor}
                  className={`q-opt ${r === opt.valor ? 'sim' : ''}`}
                  onClick={() => responder(i, opt.valor)}
                >
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{opt.valor}</span>
                  <span style={{ fontSize: 11, fontWeight: 400 }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      <div className="srq-nav" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-blue" onClick={finalizar} disabled={saving || totalRespondidas < 9}>
          {saving ? 'Salvando…' : 'Ver resultado'}
        </button>
      </div>
    </div>
  )
}

export default function PHQPage() {
  return (
    <Suspense fallback={<div className="loading">Carregando…</div>}>
      <PHQForm />
    </Suspense>
  )
}
