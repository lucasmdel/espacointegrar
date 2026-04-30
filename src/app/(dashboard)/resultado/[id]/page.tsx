'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { SRQ_QUESTIONS } from '@/lib/srq'
import type { Aplicacao } from '@/types'

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
      .then(({ data }) => {
        setApp(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="loading">Carregando resultado…</div>
  if (!app) return <div className="loading">Resultado não encontrado.</div>

  const data = new Date(app.created_at).toLocaleDateString('pt-BR')
  const resps: number[] = Array.isArray(app.respostas) ? app.respostas : []

  return (
    <div className="res-container">
      <button className="breadcrumb" onClick={() => router.push('/aplicar')}>
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Nova aplicação
      </button>

      <div className={`res-banner ${app.clinico ? 'clinico' : 'ok'}`}>
        <div className="score-circle">
          <span className="score-n">{app.score}</span>
          <span className="score-l">pontos</span>
        </div>
        <div className="banner-txt">
          <h3>{app.clinico ? 'Indicativo clínico' : 'Sem indicativo clínico'}</h3>
          <p>
            {app.clinico
              ? 'Pontuação ≥ 8 — presença de sintomas não psicóticos de sofrimento psíquico.'
              : 'Pontuação < 8 — sem indicativo significativo de sofrimento psíquico.'}
          </p>
        </div>
      </div>

      <div className="res-card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Pontuação</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-playfair), serif' }}>{app.score}/20</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Ponto de corte</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-playfair), serif' }}>≥ 8</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Respostas &quot;sim&quot;</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-playfair), serif' }}>{app.score}</div>
          </div>
        </div>

        <div className="res-section">Respostas por item</div>
        <div className="resps-grid">
          {resps.map((r, i) => (
            <div key={i} className={`resp-chip ${r === 1 ? 'chip-sim' : 'chip-nao'}`}>
              Q{i + 1}: {r === 1 ? 'Sim' : 'Não'}
            </div>
          ))}
        </div>

        <div className="res-section">Laudo gerado</div>
        <div className="laudo-text">
          <strong>Instrumento:</strong> SRQ-20 (Self-Reporting Questionnaire)<br />
          <strong>Respondente:</strong> {app.nome_paciente}{app.idade_paciente ? `, ${app.idade_paciente} anos` : ''}{app.sexo_paciente ? `, ${app.sexo_paciente}` : ''}<br />
          <strong>Data de aplicação:</strong> {data}<br />
          <strong>Pontuação total:</strong> {app.score} de 20 pontos<br />
          <strong>Ponto de corte:</strong> ≥ 8<br />
          <strong>Classificação:</strong> {app.clinico
            ? 'Indicativo clínico — acima do ponto de corte'
            : 'Sem indicativo clínico — abaixo do ponto de corte'}<br /><br />
          {app.clinico
            ? 'Os resultados indicam a presença de sintomas não psicóticos de sofrimento psíquico. Recomenda-se avaliação clínica aprofundada por profissional habilitado.'
            : 'Os resultados não indicam presença de sintomas significativos de sofrimento psíquico no momento da avaliação.'}<br /><br />
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
