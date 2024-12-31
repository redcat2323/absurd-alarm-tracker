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
      // Clear any stored session data first
      localStorage.clear(); // Clear all localStorage data
      sessionStorage.clear(); // Clear all sessionStorage data
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
      });
      
      // Force a complete page reload to clear any cached states
      window.location.href = '/';
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Tente novamente mais tarde",
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