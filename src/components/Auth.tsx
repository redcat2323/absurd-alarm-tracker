
import { useState, useEffect } from "react";
import { AuthForm } from "./auth/AuthForm";
import { PasswordResetForm } from "./auth/PasswordResetForm";
import { NewPasswordForm } from "./auth/NewPasswordForm";
import { useToast } from "@/hooks/use-toast";

export const Auth = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for error parameters in the URL
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error) {
      console.error("Erro na URL:", error, errorDescription);
      toast({
        title: "Erro na recuperação de senha",
        description: errorDescription || "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Se tiver um access_token no hash, mostra o formulário de nova senha
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  if (hashParams.get('access_token')) {
    return <NewPasswordForm />;
  }

  if (isResetPassword) {
    return <PasswordResetForm onBack={() => setIsResetPassword(false)} />;
  }

  return (
    <AuthForm 
      onLogin={onLogin}
      onResetPassword={() => setIsResetPassword(true)}
    />
  );
};
