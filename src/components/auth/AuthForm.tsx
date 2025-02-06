
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthFormProps {
  onLogin: (name: string) => void;
  onResetPassword: () => void;
}

export const AuthForm = ({ onLogin, onResetPassword }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

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
              onClick={onResetPassword}
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
