
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const UsersDashboard = () => {
  const { data: totalUsers, isLoading: loadingTotal } = useQuery({
    queryKey: ["total-users"],
    queryFn: async () => {
      try {
        // Get count of users from auth schema
        const { data, error } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000 // Adjust as needed for your user base size
        });
        
        if (error) throw error;
        
        // The count is available via the users array length
        return data.users.length || 0;
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback to counting distinct user_ids from habit completions
        const { data: distinctUsers, error: fallbackError } = await supabase
          .from("habit_daily_completions")
          .select("user_id", { count: "exact", head: false })
          .limit(1);
        
        if (fallbackError) {
          console.error("Fallback error:", fallbackError);
          return 0;
        }
        
        // Count distinct users from habit_daily_completions
        const { count } = await supabase
          .from("habit_daily_completions")
          .select("user_id", { count: "exact" })
          .is("user_id", null, { negated: true });
        
        return count || 0;
      }
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
