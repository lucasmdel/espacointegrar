export const PHQ_QUESTIONS = [
  'Pouco interesse ou prazer em fazer as coisas',
  'Sentir-se para baixo, deprimido(a) ou sem perspectiva',
  'Dificuldade para adormecer ou permanecer dormindo, ou dormir mais do que de costume',
  'Sentir-se cansado(a) ou com pouca energia',
  'Falta de apetite ou comer demais',
  'Sentir-se mal consigo mesmo(a), ou achar que é um fracasso ou que decepcionou a si mesmo(a) ou sua família',
  'Dificuldade para se concentrar nas coisas, como ler ou assistir televisão',
  'Mover-se ou falar tão devagar que outras pessoas puderam notar — ou o oposto: estar tão agitado(a) que você se movimentou muito mais do que de costume',
  'Pensar que seria melhor estar morto(a), ou ter pensamentos de se machucar de alguma forma',
]

export const PHQ_OPTIONS = [
  { valor: 0, label: 'Nenhuma vez' },
  { valor: 1, label: 'Vários dias' },
  { valor: 2, label: 'Mais da metade dos dias' },
  { valor: 3, label: 'Quase todos os dias' },
]

export interface PHQSeveridade {
  label: string
  descricao: string
  classe: 'ok' | 'amber' | 'moderado' | 'clinico'
  clinico: boolean
}

export function phqSeveridade(score: number): PHQSeveridade {
  if (score <= 4) return {
    label: 'Sem depressão ou mínima',
    descricao: 'Sintomas depressivos mínimos, sem impacto significativo no funcionamento diário.',
    classe: 'ok',
    clinico: false,
  }
  if (score <= 9) return {
    label: 'Depressão leve',
    descricao: 'Alguns sintomas depressivos que podem causar dificuldades nas atividades diárias.',
    classe: 'amber',
    clinico: false,
  }
  if (score <= 14) return {
    label: 'Depressão moderada',
    descricao: 'Sintomas depressivos moderados que provavelmente interferem na vida diária. Pode preencher critérios diagnósticos para transtorno depressivo.',
    classe: 'moderado',
    clinico: true,
  }
  if (score <= 19) return {
    label: 'Depressão moderadamente grave',
    descricao: 'Sintomas depressivos pronunciados, consistentes com transtorno depressivo maior, com impacto substancial no funcionamento diário.',
    classe: 'clinico',
    clinico: true,
  }
  return {
    label: 'Depressão grave',
    descricao: 'Sintomas depressivos graves que comprometem profundamente as atividades diárias. Requer atenção imediata.',
    classe: 'clinico',
    clinico: true,
  }
}
