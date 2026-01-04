import { supabase } from "@/integrations/supabase/client";

export interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  type: "video" | "article";
  content: string;
  thumbnail_url: string | null;
  video_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface TutorialInsert {
  title: string;
  description?: string | null;
  type: "video" | "article";
  content: string;
  thumbnail_url?: string | null;
  video_url?: string | null;
  created_by?: string | null;
  published?: boolean;
}

// Fetch all published tutorials
export const getTutorials = async () => {
  const { data, error } = await supabase
    .from("tutorials")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Tutorial[];
};

// Fetch all tutorials (admin only)
export const getAllTutorials = async () => {
  const { data, error } = await supabase
    .from("tutorials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Tutorial[];
};

// Create tutorial
export const createTutorial = async (tutorial: TutorialInsert) => {
  const { data, error } = await supabase
    .from("tutorials")
    .insert(tutorial)
    .select()
    .single();

  if (error) throw error;
  return data as Tutorial;
};

// Update tutorial
export const updateTutorial = async (id: string, tutorial: Partial<TutorialInsert>) => {
  const { data, error } = await supabase
    .from("tutorials")
    .update(tutorial)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Tutorial;
};

// Delete tutorial
export const deleteTutorial = async (id: string) => {
  const { error } = await supabase
    .from("tutorials")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Upload thumbnail
export const uploadThumbnail = async (file: File, tutorialId: string) => {
  const fileExt = file.name.split(".").pop();
  const filePath = `${tutorialId}/thumbnail.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("tutorials")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("tutorials")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Check if user is admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .rpc("has_role", { _user_id: userId, _role: "admin" });

  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
  
  return data === true;
};
