import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";
  const [showAdminButton, setShowAdminButton] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === "jhrizzon@gmail.com") {
        setShowAdminButton(true);
      } else {
        setShowAdminButton(false);
        if (isAdmin) {
          navigate("/");
        }
      }
    };

    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email === "jhrizzon@gmail.com") {
        setShowAdminButton(true);
      } else {
        setShowAdminButton(false);
        if (isAdmin) {
          navigate("/");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, isAdmin]);

  if (!showAdminButton) return null;

  return (
    <Button
      variant="outline"
      className="fixed top-4 right-16 z-50"
      onClick={() => navigate(isAdmin ? "/" : "/admin")}
    >
      {isAdmin ? "Ver Site" : "Painel Admin"}
    </Button>
  );
};