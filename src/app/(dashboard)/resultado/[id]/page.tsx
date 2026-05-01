'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { phqSeveridade } from '@/lib/phq'
import type { Aplicacao } from '@/types'

// ── helpers ──────────────────────────────────────────────────

function srqSeveridade(score: number) {
  const clinico = score >= 8
  return {
    label: clinico ? 'Indicativo clínico' : 'Sem indicativo clínico',
    descricao: clinico
      ? 'Pontuação ≥ 8 — presença de sintomas não psicóticos de sofrimento psíquico.'
      : 'Pontuação < 8 — sem indicativo significativo de sofrimento psíquico.',
    classe: clinico ? 'clinico' : 'ok',
    clinico,
  }
}

const PHQ_LABELS: Record<number, string> = {
  0: 'Nenhuma vez',
  1: 'Vários dias',
  2: 'Mais da metade',
  3: 'Quase sempre',
}

// ── componente ───────────────────────────────────────────────

export default function ResultadoPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [app, setApp] = useState<Aplicacao | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('aplicacoes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => { setApp(data); setLoading(false) })
  }, [id])

  if (loading) return <div className="loading">Carregando resultado…</div>
  if (!app)    return <div className="loading">Resultado não encontrado.</div>

  const data   = new Date(app.created_at).toLocaleDateString('pt-BR')
  const resps: number[] = Array.isArray(app.respostas) ? app.respostas : []
  const isSRQ  = app.instrumento === 'SRQ-20'
  const sev    = isSRQ ? srqSeveridade(app.score) : phqSeveridade(app.score)
  const maxScore = isSRQ ? 20 : 27

  // laudo textual
  const laudoTexto = isSRQ
    ? (app.clinico
        ? 'Os resultados indicam a presença de sintomas não psicóticos de sofrimento psíquico. Recomenda-se avaliação clínica aprofundada por profissional habilitado.'
        : 'Os resultados não indicam presença de sintomas significativos de sofrimento psíquico no momento da avaliação.')
    : (() => {
        const s = phqSeveridade(app.score)
        const textos: Record<string, string> = {
          ok:       'Os resultados indicam sintomas depressivos mínimos, sem impacto significativo no funcionamento diário. Monitoramento de rotina é recomendado.',
          amber:    'Os resultados indicam sintomas depressivos leves. Recomenda-se acompanhamento clínico e reavaliação periódica.',
          moderado: 'Os resultados indicam sintomas depressivos moderados, com provável interferência na vida diária. Intervenção terapêutica é recomendada.',
          clinico:  'Os resultados indicam sintomas depressivos graves a muito graves, com impacto substancial no funcionamento. Avaliação clínica urgente e intervenção imediata são recomendadas.',
        }
        return textos[s.classe] ?? ''
      })()

  return (
    <div className="res-container">
      <button className="breadcrumb" onClick={() => router.push('/aplicar')}>
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        Nova aplicação
      </button>

      {/* Banner de resultado */}
      <div className={`res-banner ${sev.classe}`}>
        <div className="score-circle">
          <span className="score-n">{app.score}</span>
          <span className="score-l">pontos</span>
        </div>
        <div className="banner-txt">
          <h3>{sev.label}</h3>
          <p>{sev.descricao}</p>
        </div>
      </div>

      <div className="res-card">
        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Pontuação</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-playfair), serif' }}>{app.score}/{maxScore}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>
              {isSRQ ? 'Ponto de corte' : 'Intervalo clínico'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-playfair), serif' }}>
              {isSRQ ? '≥ 8' : '≥ 10'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Instrumento</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-playfair), serif' }}>{app.instrumento}</div>
          </div>
        </div>

        {/* Respostas */}
        <div className="res-section">Respostas por item</div>
        <div className="resps-grid">
          {resps.map((r, i) => (
            <div key={i} className={`resp-chip ${isSRQ ? (r === 1 ? 'chip-sim' : 'chip-nao') : r >= 2 ? 'chip-sim' : 'chip-nao'}`}>
              {isSRQ
                ? `Q${i + 1}: ${r === 1 ? 'Sim' : 'Não'}`
                : `Q${i + 1}: ${PHQ_LABELS[r] ?? r}`}
            </div>
          ))}
        </div>

        {/* Laudo */}
        <div className="res-section">Laudo gerado</div>
        <div className="laudo-text">
          <strong>Instrumento:</strong> {app.instrumento}
          {app.instrumento === 'SRQ-20' ? ' (Self-Reporting Questionnaire)' : ' (Patient Health Questionnaire)'}
          <br />
          <strong>Respondente:</strong> {app.nome_paciente}
          {app.idade_paciente ? `, ${app.idade_paciente} anos` : ''}
          {app.sexo_paciente  ? `, ${app.sexo_paciente}` : ''}
          <br />
          <strong>Data de aplicação:</strong> {data}<br />
          <strong>Pontuação total:</strong> {app.score} de {maxScore} pontos<br />
          <strong>Classificação:</strong> {sev.label}<br /><br />
          {laudoTexto}<br /><br />
          <em style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            Este instrumento tem caráter de rastreio e não substitui avaliação clínica. Aplicado por profissional habilitado. Espaço Integrar.
          </em>
        </div>
      </div>

      <div className="res-actions">
        <button className="btn" onClick={() => router.push('/historico')}>Ver histórico</button>
        <button className="btn btn-blue" onClick={() => window.print()}>Imprimir laudo</button>
      </div>
    </div>
  )
}
