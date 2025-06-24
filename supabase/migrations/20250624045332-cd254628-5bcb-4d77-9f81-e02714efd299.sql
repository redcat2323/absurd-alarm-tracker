
-- Criar tabela para as metas diárias do Desafio 10K
CREATE TABLE public.daily_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  goal_date DATE NOT NULL,
  authority_task TEXT NOT NULL,
  authority_description TEXT,
  authority_reference TEXT,
  audience_task TEXT NOT NULL,
  audience_description TEXT,
  audience_reference TEXT,
  offer_task TEXT NOT NULL,
  offer_description TEXT,
  offer_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para completions das metas diárias
CREATE TABLE public.daily_goal_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  goal_date DATE NOT NULL,
  authority_completed BOOLEAN DEFAULT false,
  audience_completed BOOLEAN DEFAULT false,
  offer_completed BOOLEAN DEFAULT false,
  completion_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para o cronograma do Desafio 10K
CREATE TABLE public.challenge_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  youtube_videos INTEGER DEFAULT 1,
  reels INTEGER DEFAULT 3,
  carousels INTEGER DEFAULT 3,
  lives INTEGER DEFAULT 1,
  stories_daily BOOLEAN DEFAULT true,
  focus_theme TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para as novas tabelas
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goal_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_schedule ENABLE ROW LEVEL SECURITY;

-- Policies para daily_goals
CREATE POLICY "Users can view their own daily goals" 
  ON public.daily_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily goals" 
  ON public.daily_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals" 
  ON public.daily_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies para daily_goal_completions
CREATE POLICY "Users can view their own completions" 
  ON public.daily_goal_completions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions" 
  ON public.daily_goal_completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" 
  ON public.daily_goal_completions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies para challenge_schedule (público para todos os usuários)
CREATE POLICY "All users can view challenge schedule" 
  ON public.challenge_schedule 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Inserir cronograma base do Desafio 10K (12 semanas)
INSERT INTO public.challenge_schedule (week_number, youtube_videos, reels, carousels, lives, focus_theme) VALUES
(1, 1, 3, 3, 1, 'Fundamentos da Autoridade Digital'),
(2, 1, 3, 3, 1, 'Construção de Audiência Qualificada'),
(3, 1, 3, 3, 1, 'Primeira Oferta e Validação'),
(4, 1, 3, 3, 1, 'Otimização de Conversão'),
(5, 1, 3, 3, 1, 'Expansão de Canais'),
(6, 1, 3, 3, 1, 'Automação e Sistemas'),
(7, 1, 3, 3, 1, 'Escalabilidade da Oferta'),
(8, 1, 3, 3, 1, 'Parcerias Estratégicas'),
(9, 1, 3, 3, 1, 'Diversificação de Receita'),
(10, 1, 3, 3, 1, 'Otimização Avançada'),
(11, 1, 3, 3, 1, 'Preparação para Escala'),
(12, 1, 3, 3, 1, 'Consolidação e Próximos Passos');
