import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (authLoading) return;
      
      if (!user) {
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error checking onboarding:", error);
          setNeedsOnboarding(false);
        } else {
          setNeedsOnboarding(!data?.onboarding_completed);
        }
      } catch (err) {
        console.error("Error checking onboarding:", err);
        setNeedsOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user, authLoading]);

  return { needsOnboarding, loading: loading || authLoading };
};
