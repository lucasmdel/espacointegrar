export interface Profile {
  id: string
  nome: string
  crp: string | null
  role: string
  created_at: string
}

export interface Paciente {
  id: string
  user_id: string
  nome: string
  idade: number | null
  sexo: string | null
  email: string | null
  obs: string | null
  created_at: string
}

export interface Aplicacao {
  id: string
  user_id: string
  paciente_id: string | null
  instrumento: string
  score: number
  clinico: boolean
  respostas: number[]
  nome_paciente: string
  idade_paciente: number | null
  sexo_paciente: string | null
  created_at: string
}
