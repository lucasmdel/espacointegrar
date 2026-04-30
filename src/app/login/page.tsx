'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login fields
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  // Register fields
  const [nome, setNome] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [crp, setCrp] = useState('')
  const [regSenha, setRegSenha] = useState('')

  async function handleLogin() {
    if (!email || !senha) { setError('Preencha e-mail e senha.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (err) { setError('E-mail ou senha incorretos.'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleRegister() {
    if (!nome || !regEmail || !regSenha) { setError('Preencha todos os campos obrigatórios.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signUp({
      email: regEmail,
      password: regSenha,
      options: { data: { nome, crp } },
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleDemo() {
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({
      email: 'demo@integrar.com',
      password: 'demo123456',
    })
    if (err) { setError('Conta demo não disponível no momento.'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="login-body">
      {/* Painel esquerdo */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="geo geo-1" /><div className="geo geo-2" /><div className="geo geo-3" />

        <div className="login-left-logo">
          <Image src="/logo.png" alt="Espaço Integrar" width={160} height={52} className="logo-img" style={{ height: 52, width: 'auto' }} />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Monitoramento de Alvo
          </div>
        </div>

        <div className="login-left-content">
          <h2>Monitoramento de <em>Alvo</em> em Psicoterapia</h2>
          <p>Sistema de monitoramento de alvo de pacientes em psicoterapia — uso exclusivo da equipe clínica do Espaço Integrar.</p>
        </div>

        <div className="login-features">
          {[
            { icon: <polyline points="2,7 5,10 12,3" />, text: 'Registro e acompanhamento de alvos terapêuticos' },
            { icon: <><rect x="2" y="2" width="10" height="10" rx="2"/><line x1="5" y1="7" x2="9" y2="7"/><line x1="7" y1="5" x2="7" y2="9"/></>, text: 'Histórico de evolução por paciente' },
            { icon: <><path d="M7 2v5l3 2"/><circle cx="7" cy="7" r="5"/></>, text: 'Avaliações com instrumentos validados' },
            { icon: <><rect x="2" y="4" width="10" height="8" rx="1"/><path d="M5 4V3a2 2 0 0 1 4 0v1"/></>, text: 'Acesso restrito à equipe clínica' },
          ].map((f, i) => (
            <div className="feat" key={i}>
              <div className="feat-dot">
                <svg viewBox="0 0 14 14">{f.icon}</svg>
              </div>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito */}
      <div className="login-right">
        <div className="form-wrap">
          <div className="form-header">
            <h1>{tab === 'login' ? 'Bem-vindo(a)' : 'Criar acesso'}</h1>
            <p>{tab === 'login' ? 'Entre com suas credenciais para acessar o sistema.' : 'Preencha seus dados para solicitar acesso.'}</p>
          </div>

          <div className="tabs">
            <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Entrar</button>
            <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError('') }}>Cadastrar</button>
          </div>

          {error && <div className="err">{error}</div>}

          {tab === 'login' ? (
            <>
              <div className="field">
                <label>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div className="field">
                <label>Senha</label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <button className="btn-submit" onClick={handleLogin} disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar no sistema'}
              </button>
              <div className="divider">ou</div>
              <button className="btn-demo" onClick={handleDemo} disabled={loading}>Entrar como demonstração</button>
            </>
          ) : (
            <>
              <div className="field">
                <label>Nome completo</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Dra. Ana Lima" />
              </div>
              <div className="field">
                <label>E-mail</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
              <div className="field">
                <label>CRP</label>
                <input type="text" value={crp} onChange={e => setCrp(e.target.value)} placeholder="Ex: 06/12345" />
              </div>
              <div className="field">
                <label>Senha <span style={{ color: 'var(--gray-400)' }}>(mínimo 6 caracteres)</span></label>
                <input type="password" value={regSenha} onChange={e => setRegSenha(e.target.value)} placeholder="••••••••" />
              </div>
              <button className="btn-submit" onClick={handleRegister} disabled={loading}>
                {loading ? 'Criando conta…' : 'Criar acesso'}
              </button>
            </>
          )}

          <div className="notice">
            🔒 Sistema de uso interno do Espaço Integrar. O acesso é restrito aos psicólogos da equipe clínica.
          </div>
        </div>
      </div>
    </div>
  )
}
