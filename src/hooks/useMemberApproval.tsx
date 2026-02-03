import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface MemberApprovalState {
  isApproved: boolean;
  isPending: boolean;
  loading: boolean;
  memberData: {
    id: string;
    name: string;
    status: string;
  } | null;
  refetch: () => Promise<void>;
}

export const useMemberApproval = (): MemberApprovalState => {
  const { user, loading: authLoading } = useAuth();
  const [isApproved, setIsApproved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<MemberApprovalState["memberData"]>(null);

  const checkApprovalStatus = useCallback(async () => {
    if (!user) {
      setIsApproved(false);
      setIsPending(false);
      setMemberData(null);
      setLoading(false);
      return;
    }

    try {
      // First check if user is an admin - admins bypass approval
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        setIsApproved(true);
        setIsPending(false);
        setLoading(false);
        return;
      }

      // Check team_members status
      const { data: member, error } = await supabase
        .from("team_members")
        .select("id, name, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking member status:", error);
        setIsApproved(false);
        setIsPending(false);
        setLoading(false);
        return;
      }

      if (member) {
        setMemberData(member);
        if (member.status === "active") {
          setIsApproved(true);
          setIsPending(false);
        } else if (member.status === "pending") {
          setIsApproved(false);
          setIsPending(true);
        } else {
          setIsApproved(false);
          setIsPending(false);
        }
      } else {
        // No team_member entry - not approved
        setIsApproved(false);
        setIsPending(false);
        setMemberData(null);
      }
    } catch (err) {
      console.error("Error in approval check:", err);
      setIsApproved(false);
      setIsPending(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      checkApprovalStatus();
    }
  }, [authLoading, checkApprovalStatus]);

  return {
    isApproved,
    isPending,
    loading: loading || authLoading,
    memberData,
    refetch: checkApprovalStatus,
  };
};
