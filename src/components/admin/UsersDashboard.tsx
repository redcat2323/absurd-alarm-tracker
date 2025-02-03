import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserEngagement = {
  user_id: string;
  total_completions: number;
  last_active: string;
};

const UsersDashboard = () => {
  const { data: totalUsers, isLoading: loadingTotal } = useQuery({
    queryKey: ["total-users"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("habit_daily_completions")
        .select("user_id", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: userEngagement, isLoading: loadingEngagement } = useQuery({
    queryKey: ["user-engagement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_daily_completions")
        .select("user_id, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Agrupar completions por usuário
      const userStats = data.reduce((acc: { [key: string]: any }, curr) => {
        if (!acc[curr.user_id]) {
          acc[curr.user_id] = {
            user_id: curr.user_id,
            total_completions: 0,
            last_active: curr.created_at,
          };
        }
        acc[curr.user_id].total_completions += 1;
        return acc;
      }, {});

      // Converter para array e ordenar por total de completions
      const engagement: UserEngagement[] = Object.values(userStats)
        .sort((a: any, b: any) => b.total_completions - a.total_completions);

      return engagement;
    },
  });

  if (loadingTotal || loadingEngagement) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos (Últimos 30 dias)
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userEngagement?.filter(user => {
                const lastActive = new Date(user.last_active);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return lastActive >= thirtyDaysAgo;
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engajamento dos Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Usuário</TableHead>
                <TableHead>Total de Completions</TableHead>
                <TableHead>Última Atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userEngagement?.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.user_id}</TableCell>
                  <TableCell>{user.total_completions}</TableCell>
                  <TableCell>
                    {new Date(user.last_active).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersDashboard;