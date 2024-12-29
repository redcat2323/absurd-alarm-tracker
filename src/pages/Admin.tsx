import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import DailyTextForm from "@/components/admin/DailyTextForm";
import WeeklyBookForm from "@/components/admin/WeeklyBookForm";

const ADMIN_EMAIL = "jhrizzon@gmail.com";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuth = !!session;
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const userEmail = session?.user?.email;
        if (userEmail === ADMIN_EMAIL) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      }
    });
  }, []);

  const handleLogin = (name: string) => {
    setIsAuthenticated(true);
    toast({
      title: "Bem-vindo!",
      description: `Login realizado com sucesso, ${name}!`,
    });
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Não encontrado</h1>
          <p className="text-muted-foreground">Esta página não está disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Painel Administrativo
        </h1>
        <DailyTextForm />
        <WeeklyBookForm />
      </div>
    </div>
  );
};

export default Admin;