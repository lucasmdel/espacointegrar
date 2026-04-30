'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Aplicacao } from '@/types'

export default function HistoricoPage() {
  const supabase = createClient()
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('aplicacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setAplicacoes(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">Carregando…</div>

  return (
    <>
      <div className="page-header">
        <h2>Histórico de aplicações</h2>
        <p>Registro completo de todas as avaliações realizadas.</p>
      </div>

      <div className="data-table">
        <div className="table-head hist-cols">
          <div>Paciente</div>
          <div>Instrumento</div>
          <div>Pontuação</div>
          <div>Resultado</div>
          <div>Data</div>
        </div>
        {aplicacoes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            Nenhuma aplicação registrada ainda.
          </div>
        ) : (
          aplicacoes.map(a => (
            <div className="table-row hist-cols" key={a.id}>
              <div className="cell-name">
                <div className="av">{a.nome_paciente.charAt(0)}</div>
                {a.nome_paciente}
              </div>
              <div className="cell">{a.instrumento}</div>
              <div className="cell">{a.score}/20</div>
              <div className="cell">
                <span className={`badge ${a.clinico ? 'badge-clinico' : 'badge-ok'}`}>
                  {a.clinico ? 'Clínico' : 'Não clínico'}
                </span>
              </div>
              <div className="cell">{new Date(a.created_at).toLocaleDateString('pt-BR')}</div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
