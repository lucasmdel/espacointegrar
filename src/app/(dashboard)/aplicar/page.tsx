'use client'

import { useRouter } from 'next/navigation'

export default function AplicarPage() {
  const router = useRouter()

  return (
    <>
      <div className="page-header">
        <h2>Aplicar instrumento</h2>
        <p>Selecione o instrumento para iniciar a aplicação.</p>
      </div>

      <div className="instrumento-grid">
        <div className="instrumento-card" onClick={() => router.push('/aplicar/srq')}>
          <div>
            <div className="inst-sigla">SRQ-20</div>
            <div className="inst-name">Self-Reporting Questionnaire</div>
          </div>
          <div className="inst-desc">
            Rastreio de transtornos mentais não psicóticos. Resposta em escolha forçada (sim/não). Ponto de corte ≥ 8.
          </div>
          <div className="inst-footer">
            <span className="inst-meta">20 questões · ~5 min</span>
            <span className="badge badge-ativo">Disponível</span>
          </div>
        </div>

        <div className="instrumento-card locked">
          <div>
            <div className="inst-sigla">PHQ-9</div>
            <div className="inst-name">Patient Health Questionnaire</div>
          </div>
          <div className="inst-desc">Rastreio e mensuração da gravidade da depressão. Escala Likert de 4 pontos.</div>
          <div className="inst-footer">
            <span className="inst-meta">9 questões · ~3 min</span>
            <span className="badge badge-soon">Em breve</span>
          </div>
        </div>

        <div className="instrumento-card locked">
          <div>
            <div className="inst-sigla">GAD-7</div>
            <div className="inst-name">Generalized Anxiety Disorder</div>
          </div>
          <div className="inst-desc">Avaliação da gravidade do transtorno de ansiedade generalizada. Escala Likert.</div>
          <div className="inst-footer">
            <span className="inst-meta">7 questões · ~2 min</span>
            <span className="badge badge-soon">Em breve</span>
          </div>
        </div>
      </div>
    </>
  )
}
