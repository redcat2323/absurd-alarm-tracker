import { supabase } from "@/integrations/supabase/client";

export const updateReadingProgress = async (userId: string) => {
  try {
    // Update default_habit_completions table for Reading habit (id: 4)
    await supabase
      .from('default_habit_completions')
      .upsert({
        user_id: userId,
        habit_id: 4, // ID do hábito "Leitura Diária"
        completed_days: 4,
        progress: (4 / 365) * 100, // Calcula a porcentagem
        completed: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,habit_id'
      });

    console.log("Progresso do hábito de leitura atualizado com sucesso");
  } catch (error) {
    console.error("Erro ao atualizar progresso do hábito de leitura:", error);
  }
};

// Executar a função imediatamente
const { data: { session } } = await supabase.auth.getSession();
if (session?.user?.id) {
  await updateReadingProgress(session.user.id);
}