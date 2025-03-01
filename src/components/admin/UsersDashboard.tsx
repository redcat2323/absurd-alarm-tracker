
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserStatsCard from "./dashboard/UserStatsCard";
import ActiveUsersCard from "./dashboard/ActiveUsersCard";
import UsersTable from "./dashboard/UsersTable";
import { 
  fetchTotalUsers, 
  fetchWeeklyActiveUsers, 
  fetchActiveUsersList, 
  fetchAllUsersList 
} from "@/services/userQueries";

const UsersDashboard = () => {
  // Query for total registered users
  const { data: totalUsers, isLoading: loadingTotalUsers } = useQuery({
    queryKey: ["total-users"],
    queryFn: fetchTotalUsers,
  });

  // Query for weekly active users
  const { data: weeklyActiveUsers, isLoading: loadingActiveUsers } = useQuery({
    queryKey: ["weekly-active-users"],
    queryFn: fetchWeeklyActiveUsers,
  });

  // Query for active users list with email and last login
  const { data: activeUsersList, isLoading: loadingActiveUsersList } = useQuery({
    queryKey: ["active-users-list"],
    queryFn: fetchActiveUsersList,
  });

  // Query for ALL users list with email and last login
  const { data: usersList, isLoading: loadingUsersList } = useQuery({
    queryKey: ["users-list"],
    queryFn: fetchAllUsersList,
  });

  if (loadingTotalUsers && loadingActiveUsers && loadingUsersList) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <UserStatsCard 
          title="Total de Usuários Cadastrados"
          value={totalUsers || 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />

        <ActiveUsersCard 
          activeUsersCount={weeklyActiveUsers || 0}
          activeUsersList={activeUsersList}
          isLoading={loadingActiveUsersList}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista Completa de Usuários ({usersList?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable users={usersList} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersDashboard;
