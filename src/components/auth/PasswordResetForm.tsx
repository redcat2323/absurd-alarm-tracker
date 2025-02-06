
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PasswordResetForm = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Iniciando processo de recuperação de senha para:", email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error("Erro ao enviar email de recuperação:", error);
        throw error;
      }
      
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      onBack();
    } catch (error: any) {
      console.error("Erro capturado:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="p-6 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Recuperar Senha
        </h2>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Enviar Email de Recuperação
          </Button>
          <Button
            variant="link"
            className="w-full"
            onClick={onBack}
          >
            Voltar ao login
          </Button>
        </form>
      </Card>
    </div>
  );
};

