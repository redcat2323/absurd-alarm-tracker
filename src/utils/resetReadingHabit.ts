import { supabase } from "@/integrations/supabase/client";
import { removeDailyCompletion } from "@/services/habitCompletions";

export const resetReadingHabit = async (userId: string) => {
  try {
    await removeDailyCompletion(userId, 4, false); // 4 é o ID do hábito "Leitura Diária"
    console.log("Hábito de leitura resetado com sucesso");
  } catch (error) {
    console.error("Erro ao resetar hábito de leitura:", error);
  }
};

// Executar a função imediatamente
const { data: { session } } = await supabase.auth.getSession();
if (session?.user?.id) {
  await resetReadingHabit(session.user.id);
}