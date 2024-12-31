import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const LogoutButton = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      className="hover:bg-transparent"
      title="Sair"
    >
      <LogOut className="h-5 w-5 text-muted-foreground hover:text-primary" />
    </Button>
  );
};