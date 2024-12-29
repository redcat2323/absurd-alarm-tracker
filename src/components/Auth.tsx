import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@supabase/supabase-js";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and Anon Key are required");
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const Auth = ({ onLogin }: { onLogin: (name: string) => void }) => {
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
          description: "Verifique seu email para confirmar o cadastro.",
        });
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
    <Card className="p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isSignUp ? "Criar conta" : "Login"}
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
        />
        <Button type="submit" className="w-full">
          {isSignUp ? "Cadastrar" : "Entrar"}
        </Button>
      </form>
      <Button
        variant="link"
        className="w-full mt-2"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp
          ? "Já tem uma conta? Faça login"
          : "Não tem uma conta? Cadastre-se"}
      </Button>
    </Card>
  );
};