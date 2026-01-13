import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type SavedContent = Tables<"saved_content">;
export type SavedContentInsert = TablesInsert<"saved_content">;
export type GrowthStats = Tables<"growth_stats">;
export type ActivityLog = Tables<"activity_log">;

// Content Calendar types
export interface ContentCalendarItem {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  content_type: string;
  platform: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: string;
  priority: string;
  tags: string[];
  notes: string | null;
  source_tool: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentCalendarInsert {
  user_id: string;
  title: string;
  content?: string | null;
  content_type?: string;
  platform?: string;
  scheduled_date: string;
  scheduled_time?: string | null;
  status?: string;
  priority?: string;
  tags?: string[];
  notes?: string | null;
  source_tool?: string | null;
}

// Saved Content functions
export const getSavedContent = async (userId: string) => {
  const { data, error } = await supabase
    .from("saved_content")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const addSavedContent = async (content: SavedContentInsert) => {
  const { data, error } = await supabase
    .from("saved_content")
    .insert(content)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSavedContent = async (id: string) => {
  const { error } = await supabase
    .from("saved_content")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Growth Stats functions
export const getGrowthStats = async (userId: string, limit = 30) => {
  const { data, error } = await supabase
    .from("growth_stats")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const addGrowthStats = async (stats: TablesInsert<"growth_stats">) => {
  const { data, error } = await supabase
    .from("growth_stats")
    .upsert(stats, { onConflict: "user_id,date,platform" })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Activity Log functions
export const getActivityLog = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const addActivityLog = async (activity: TablesInsert<"activity_log">) => {
  const { data, error } = await supabase
    .from("activity_log")
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Content Calendar functions
export const getContentCalendar = async (userId: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from("content_calendar")
    .select("*")
    .eq("user_id", userId)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date", { ascending: true });

  if (error) throw error;
  return data as ContentCalendarItem[];
};

export const addContentCalendarItem = async (item: ContentCalendarInsert) => {
  const { data, error } = await supabase
    .from("content_calendar")
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateContentCalendarItem = async (id: string, updates: Partial<ContentCalendarInsert>) => {
  const { data, error } = await supabase
    .from("content_calendar")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteContentCalendarItem = async (id: string) => {
  const { error } = await supabase
    .from("content_calendar")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
