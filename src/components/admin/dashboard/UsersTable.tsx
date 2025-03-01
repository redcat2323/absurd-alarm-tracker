
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: string;
  email: string;
  lastLogin: string;
}

interface UsersTableProps {
  users: User[] | undefined;
}

const UsersTable = ({ users }: UsersTableProps) => {
  if (!users) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-h-[500px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Último Login</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.lastLogin ? format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm') : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
