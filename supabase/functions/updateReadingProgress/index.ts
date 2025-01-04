import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update reading progress for specific user
    const { error } = await supabaseClient
      .from('default_habit_completions')
      .upsert({
        user_id: 'YOUR_USER_ID', // We'll replace this with the actual user ID
        habit_id: 4, // ID do hábito "Leitura Diária"
        completed_days: 4,
        progress: (4 / 365) * 100,
        completed: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,habit_id'
      })

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Progresso de leitura atualizado com sucesso' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})