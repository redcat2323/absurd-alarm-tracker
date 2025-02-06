
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const Auth = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isNewPassword, setIsNewPassword] = useState(false);
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
      setIsResetPassword(false);
    } catch (error: any) {
      console.error("Erro capturado:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Iniciando atualização de senha");
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Erro ao atualizar senha:", error);
        throw error;
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
      setIsNewPassword(false);
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode fazer login.",
        });
        setIsSignUp(false);
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const userName = data.user?.user_metadata?.name || "Usuário";
        onLogin(userName);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Check if we're in password reset mode from URL
  useEffect(() => {
    const checkPasswordReset = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      
      // Verifica se estamos em modo de recuperação de senha
      if (searchParams.get('reset') === 'true' || hashParams.get('type') === 'recovery') {
        console.log("Modo de recuperação de senha detectado");
        setIsNewPassword(true);
      }

      // Verifica se há algum erro na URL
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
  }

  if (isResetPassword) {
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
              onClick={() => setIsResetPassword(false)}
            >
              Voltar ao login
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
          O Pior Ano<br className="md:hidden" /> da Sua Vida
        </h1>
        <p className="text-xl md:text-2xl mb-6 text-muted-foreground">
          Prepare-se para a jornada mais desafiadora e transformadora da sua vida
        </p>
      </div>

      <Card className="p-6 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isSignUp ? "Comece Sua Jornada" : "Continue Sua Jornada"}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <Input
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            {isSignUp ? "Começar Agora" : "Entrar"}
          </Button>
        </form>
        <div className="mt-4 space-y-2">
          <Button
            variant="link"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Já tem uma conta? Faça login"
              : "Ainda não tem conta? Cadastre-se"}
          </Button>
          {!isSignUp && (
            <Button
              variant="link"
              className="w-full text-muted-foreground"
              onClick={() => setIsResetPassword(true)}
            >
              Esqueceu sua senha?
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-8 text-center max-w-2xl">
        <p className="text-muted-foreground">
          "O Pior Ano da Sua Vida é um programa intensivo de desenvolvimento pessoal que vai te desafiar todos os dias. 
          Se você está procurando uma mudança real, você está no lugar certo."
        </p>
      </div>
    </div>
  );
};
