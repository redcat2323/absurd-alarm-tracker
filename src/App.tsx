import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "./components/ThemeToggle";
import { LogoutButton } from "./components/LogoutButton";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: true,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        console.log("Iniciando verificação de autenticação...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao obter sessão:", error);
          return;
        }

        if (!session) {
          console.log("Nenhuma sessão encontrada, limpando dados locais");
          localStorage.clear();
          sessionStorage.clear();
        } else {
          console.log("Sessão encontrada para usuário:", session.user.email);
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
      }
    };
    
    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Mudança no estado de autenticação:", event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Usuário logado:", session.user.email);
        localStorage.setItem('supabase.auth.token', session.access_token);
        // Força um recarregamento dos dados após o login
        queryClient.invalidateQueries();
      } else if (event === 'SIGNED_OUT') {
        console.log("Usuário deslogado, limpando dados");
        localStorage.clear();
        sessionStorage.clear();
        // Limpa o cache do React Query
        queryClient.clear();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <TooltipProvider>
          <BrowserRouter>
            <div className="flex justify-between items-center p-4">
              <ThemeToggle />
              <LogoutButton />
            </div>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;