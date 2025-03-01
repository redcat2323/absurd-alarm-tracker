
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: string;
  email: string;
  lastLogin: string;
}

interface ActiveUsersListProps {
  users: User[] | undefined;
}

const ActiveUsersList = ({ users }: ActiveUsersListProps) => {
  if (!users || users.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 max-h-60 overflow-auto">
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

export default ActiveUsersList;
