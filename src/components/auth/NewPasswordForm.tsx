
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

export const NewPasswordForm = () => {
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Em dispositivos móveis, alguns navegadores podem ter problemas com o hash
      // então vamos tentar obter o token de duas maneiras
      let accessToken;
      let refreshToken;

      if (isMobile) {
        // Em mobile, tenta obter os tokens da URL inteira
        const urlParams = new URLSearchParams(window.location.search);
        accessToken = urlParams.get('access_token') || undefined;
        refreshToken = urlParams.get('refresh_token') || undefined;
      }

      if (!accessToken) {
        // Se não encontrou na URL ou não é mobile, tenta do hash
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token') || '';
      }

      if (!accessToken) {
        throw new Error("Link inválido. Por favor, solicite um novo link de recuperação de senha.");
      }

      console.log("Tentando atualizar senha com token:", !!accessToken);

      // Set session with the access token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (sessionError) {
        console.error("Erro ao estabelecer sessão:", sessionError);
        throw new Error("Link expirado ou inválido. Por favor, solicite um novo link de recuperação de senha.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso. Você já pode fazer login.",
      });

      // Redirect to home page
      window.location.href = "/";
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar senha. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="p-6 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Definir Nova Senha
        </h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Atualizar Senha
          </Button>
        </form>
      </Card>
    </div>
  );
};
