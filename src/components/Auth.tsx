
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "./auth/AuthForm";
import { PasswordResetForm } from "./auth/PasswordResetForm";
import { NewPasswordForm } from "./auth/NewPasswordForm";
import { useToast } from "@/hooks/use-toast";

export const Auth = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isNewPassword, setIsNewPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkPasswordReset = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      
      if (searchParams.get('type') === 'recovery' || hashParams.get('access_token')) {
        console.log("Modo de recuperação de senha detectado");
        setIsNewPassword(true);
        await supabase.auth.signOut();
      }

      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');
      if (error) {
        console.error("Erro detectado na URL:", error, errorDescription);
        toast({
          title: "Erro na recuperação de senha",
          description: errorDescription || "Ocorreu um erro ao processar sua solicitação",
          variant: "destructive",
        });
      }
    };

    checkPasswordReset();
  }, [toast]);

  if (isNewPassword) {
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
