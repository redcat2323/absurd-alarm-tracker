
import { useState } from "react";
import { AuthForm } from "./auth/AuthForm";
import { PasswordResetForm } from "./auth/PasswordResetForm";
import { NewPasswordForm } from "./auth/NewPasswordForm";

export const Auth = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [isResetPassword, setIsResetPassword] = useState(false);

  // Se estiver na rota de reset-password, mostra o formulário de nova senha
  if (window.location.pathname === "/reset-password") {
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
