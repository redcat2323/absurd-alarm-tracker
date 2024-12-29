import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

export const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  return (
    <Button
      variant="outline"
      className="fixed top-4 right-16 z-50"
      onClick={() => navigate(isAdmin ? "/" : "/admin")}
    >
      {isAdmin ? "Ver Site" : "Painel Admin"}
    </Button>
  );
};