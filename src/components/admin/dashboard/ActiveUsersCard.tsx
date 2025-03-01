
import { UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActiveUsersList from "./ActiveUsersList";
import { User } from "@/services/userQueries";

interface ActiveUsersCardProps {
  activeUsersCount: number;
  activeUsersList: User[] | undefined;
  isLoading: boolean;
}

const ActiveUsersCard = ({ activeUsersCount, activeUsersList, isLoading }: ActiveUsersCardProps) => {
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Usuários Ativos (Últimos 7 dias)
        </CardTitle>
        <UserCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{activeUsersCount}</div>
        <ActiveUsersList users={activeUsersList} />
      </CardContent>
    </Card>
  );
};

export default ActiveUsersCard;
