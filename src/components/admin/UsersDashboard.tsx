
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const UsersDashboard = () => {
  const { data: totalUsers, isLoading: loadingTotal } = useQuery({
    queryKey: ["total-users"],
    queryFn: async () => {
      // Get count of users from auth schema
      const { count, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (error) {
        console.error("Error fetching users:", error);
        // Fallback to counting users with habit completions
        const { count: fallbackCount, error: fallbackError } = await supabase
          .from("habit_daily_completions")
          .select("user_id", { count: "exact", head: true })
          .eq("user_id", "user_id");
        
        if (fallbackError) throw fallbackError;
        return fallbackCount || 0;
      }
      
      return count || 0;
    },
  });

  if (loadingTotal) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Usuários
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersDashboard;
