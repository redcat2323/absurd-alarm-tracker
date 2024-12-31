import { useState, useEffect } from "react";
import { Auth } from "@/components/Auth";
import { DailyText } from "@/components/DailyText";
import { WeeklyBook } from "@/components/WeeklyBook";
import { Header } from "@/components/Header";
import { HabitList } from "@/components/HabitList";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
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
  }, []);

  const handleLogin = (name: string) => {
    setIsAuthenticated(true);
    setUserName(name);
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
      <div className="max-w-6xl mx-auto">
        <Header userName={userName} dayOfYear={dayOfYear} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <HabitList />
          
          <div className="space-y-4">
            <DailyText />
            <WeeklyBook />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;