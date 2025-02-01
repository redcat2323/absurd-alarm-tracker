import { useState, useEffect } from "react";
import { Auth } from "@/components/Auth";
import { DailyText } from "@/components/DailyText";
import { WeeklyBook } from "@/components/WeeklyBook";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HabitsSection } from "@/components/HabitsSection";
import { AchievementsSection } from "@/components/AchievementsSection";
import { ProgressDashboard } from "@/components/dashboard/ProgressDashboard";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<string>();
  const [dayOfYear, setDayOfYear] = useState(0);

  useEffect(() => {
    const calculateDayOfYear = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const day = Math.floor(diff / oneDay);
      setDayOfYear(day);
    };

    calculateDayOfYear();
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setUserName(session.user.user_metadata?.name || "Usuário");
        setUserId(session.user.id);
      }
    };
    
    checkSession();
  }, []);

  const handleLogin = async (name: string) => {
    setIsAuthenticated(true);
    setUserName(name);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header userName={userName} dayOfYear={dayOfYear} />
        
        {userId && (
          <ProgressDashboard userId={userId} />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {userId && (
            <HabitsSection userId={userId} />
          )}
          
          <div className="space-y-8">
            <DailyText />
            <WeeklyBook />
          </div>
        </div>

        {userId && (
          <AchievementsSection userId={userId} />
        )}
      </div>
    </div>
  );
};

export default Index;