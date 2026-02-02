import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useAdmin } from "./useAdmin";
import { supabase } from "@/integrations/supabase/client";

interface ToolAccess {
  tool_id: string;
  granted_at: string;
  expires_at: string | null;
}

export const useToolAccess = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [accessList, setAccessList] = useState<ToolAccess[]>([]);
  const [toolsLocked, setToolsLocked] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchAccess = useCallback(async () => {
    if (!user) {
      setAccessList([]);
      setLoading(false);
      return;
    }

    try {
      // Check if tools are locked globally
      const { data: settings } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "tools_locked")
        .single();

      setToolsLocked(settings?.setting_value === "true");

      // Fetch user's tool access
      const { data, error } = await supabase
        .from("user_tool_access")
        .select("tool_id, granted_at, expires_at")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching tool access:", error);
      } else {
        setAccessList(data || []);
      }
    } catch (err) {
      console.error("Error checking tool access:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  const hasAccess = useCallback(
    (toolId: string): boolean => {
      // Admins always have access
      if (isAdmin) return true;

      // If tools aren't locked globally, everyone has access
      if (!toolsLocked) return true;

      // Check if user has specific access to this tool
      const access = accessList.find((a) => a.tool_id === toolId);
      if (!access) return false;

      // Check if access has expired
      if (access.expires_at && new Date(access.expires_at) < new Date()) {
        return false;
      }

      return true;
    },
    [isAdmin, toolsLocked, accessList]
  );

  const hasAnyAccess = useCallback((): boolean => {
    if (isAdmin) return true;
    if (!toolsLocked) return true;
    return accessList.length > 0;
  }, [isAdmin, toolsLocked, accessList]);

  return {
    hasAccess,
    hasAnyAccess,
    accessList,
    toolsLocked,
    loading,
    refetch: fetchAccess,
  };
};

// Hook for admin to manage tool access
export const useToolAccessAdmin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsersWithAccess = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_tool_access")
        .select(`
          id,
          user_id,
          tool_id,
          granted_at,
          expires_at,
          granted_by
        `)
        .order("granted_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users with access:", err);
    } finally {
      setLoading(false);
    }
  };

  const grantAccess = async (userId: string, toolIds: string[], expiresAt?: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const inserts = toolIds.map((toolId) => ({
        user_id: userId,
        tool_id: toolId,
        granted_by: user?.id,
        expires_at: expiresAt?.toISOString() || null,
      }));

      const { error } = await supabase
        .from("user_tool_access")
        .upsert(inserts, { onConflict: "user_id,tool_id" });

      if (error) throw error;
      await fetchUsersWithAccess();
      return { success: true };
    } catch (err) {
      console.error("Error granting access:", err);
      return { success: false, error: err };
    }
  };

  const revokeAccess = async (userId: string, toolId: string) => {
    try {
      const { error } = await supabase
        .from("user_tool_access")
        .delete()
        .eq("user_id", userId)
        .eq("tool_id", toolId);

      if (error) throw error;
      await fetchUsersWithAccess();
      return { success: true };
    } catch (err) {
      console.error("Error revoking access:", err);
      return { success: false, error: err };
    }
  };

  const grantAllToolsAccess = async (userId: string, expiresAt?: Date) => {
    const allToolIds = [
      "tag-generator", "script-generator", "text-to-script", "shorts-ideas",
      "youtube-planner", "thumbnail-ideas", "video-hook", "growth-calculator",
      "watch-time", "engagement", "growth-predictor", "trending", "revenue-calc",
      "seo-score", "competitor", "title-tester", "best-time", "description-gen",
      "hashtag-generator", "caption-generator", "reels-ideas", "story-ideas",
      "carousel-planner", "bio-generator", "ig-growth-calc", "ig-engagement",
      "ig-trending", "reach-estimator", "content-calendar", "ig-best-time",
      "collab-finder", "content-pillars"
    ];
    return grantAccess(userId, allToolIds, expiresAt);
  };

  const revokeAllAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_tool_access")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      await fetchUsersWithAccess();
      return { success: true };
    } catch (err) {
      console.error("Error revoking all access:", err);
      return { success: false, error: err };
    }
  };

  const toggleToolsLocked = async (locked: boolean) => {
    try {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          setting_key: "tools_locked",
          setting_value: locked ? "true" : "false",
        }, { onConflict: "setting_key" });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Error toggling tools locked:", err);
      return { success: false, error: err };
    }
  };

  return {
    users,
    loading,
    fetchUsersWithAccess,
    grantAccess,
    revokeAccess,
    grantAllToolsAccess,
    revokeAllAccess,
    toggleToolsLocked,
  };
};
