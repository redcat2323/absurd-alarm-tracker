
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";
import { subDays } from "date-fns";

const UsersDashboard = () => {
  // Query for total registered users
  const { data: totalUsers, isLoading: loadingTotalUsers } = useQuery({
    queryKey: ["total-users"],
    queryFn: async () => {
      try {
        // Get count of users from auth schema
        const { data, error } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000 // Adjust as needed for your user base size
        });
        
        if (error) throw error;
        
        // Return the total number of registered users
        return data.users.length || 0;
      } catch (error) {
        console.error("Error fetching total users:", error);
        return 0;
      }
    },
  });

  // Query for weekly active users
  const { data: weeklyActiveUsers, isLoading: loadingActiveUsers } = useQuery({
    queryKey: ["weekly-active-users"],
    queryFn: async () => {
      try {
        // Get date from 7 days ago
        const sevenDaysAgo = subDays(new Date(), 7).toISOString().split('T')[0];
        
        // Count distinct users who completed a habit in the last 7 days
        const { count, error } = await supabase
          .from("habit_daily_completions")
          .select("user_id", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo)
          .is("user_id", null, { negated: true });
        
        if (error) throw error;
        
        return count || 0;
      } catch (error) {
        console.error("Error fetching weekly active users:", error);
        return 0;
      }
    },
  });

  if (loadingTotalUsers && loadingActiveUsers) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Usuários Cadastrados
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Usuários Ativos (Últimos 7 dias)
          </CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weeklyActiveUsers}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersDashboard;
