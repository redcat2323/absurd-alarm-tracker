import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export const LogoutButton = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      console.log("Iniciando processo de logout...");
      
      // Clear React Query cache first
      queryClient.clear();
      console.log("Cache do React Query limpo");
      
      // Clear any stored session data
      localStorage.clear();
      sessionStorage.clear();
      console.log("Dados locais limpos");
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Logout do Supabase realizado com sucesso");
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
      });
      
      // Force a complete page reload to clear any cached states
      window.location.href = '/';
    } catch (error: any) {
      console.error('Erro durante o logout:', error);
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