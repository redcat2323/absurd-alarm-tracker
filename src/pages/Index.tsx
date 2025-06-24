
import { useState, useEffect } from "react";
import { Auth } from "@/components/Auth";
import { DailyText } from "@/components/DailyText";
import { WeeklyBook } from "@/components/WeeklyBook";
import { supabase } from "@/integrations/supabase/client";
import { HabitsSection } from "@/components/HabitsSection";
import { AchievementsSection } from "@/components/AchievementsSection";
import { ProgressDashboard } from "@/components/dashboard/ProgressDashboard";
import { BigPlanDashboard } from "@/components/BigPlanDashboard";
import { WeeklyHabitScore } from "@/components/WeeklyHabitScore";
import { ChallengeCountdown } from "@/components/challenge/ChallengeCountdown";
import { DailyGoals } from "@/components/challenge/DailyGoals";
import { WeeklyProgress } from "@/components/challenge/WeeklyProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
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
      <div className="max-w-7xl mx-auto space-y-8">
        <ChallengeCountdown />
        
        <Tabs defaultValue="challenge" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="challenge">Desafio 10K</TabsTrigger>
            <TabsTrigger value="bigplan">Big Plan</TabsTrigger>
            <TabsTrigger value="habits">Hábitos Diários</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
          </TabsList>

          <TabsContent value="challenge" className="space-y-8">
            {userId && (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <DailyGoals userId={userId} />
                </div>
                <div>
                  <WeeklyProgress userId={userId} />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bigplan" className="space-y-8">
            {userId && (
              <>
                <BigPlanDashboard userId={userId} />
                <WeeklyHabitScore userId={userId} />
              </>
            )}
          </TabsContent>

          <TabsContent value="habits" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {userId && (
                <HabitsSection userId={userId} />
              )}
              
              <div className="space-y-8">
                <DailyText />
                <WeeklyBook />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-8">
            {userId && (
              <>
                <ProgressDashboard userId={userId} />
                <AchievementsSection userId={userId} />
              </>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DailyText />
              <WeeklyBook />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
