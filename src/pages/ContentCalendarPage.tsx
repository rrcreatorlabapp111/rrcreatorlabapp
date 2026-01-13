import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Edit2, Clock, Tag, Youtube, Instagram, Video, FileText, Lightbulb, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";

interface CalendarItem {
  id: string;
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
}

const platformIcons: Record<string, React.ComponentType<any>> = {
  youtube: Youtube,
  instagram: Instagram,
  shorts: Video,
  reels: Video,
};

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  published: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/20 text-primary",
  high: "bg-destructive/20 text-destructive",
};

export const ContentCalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    content_type: "idea",
    platform: "youtube",
    scheduled_date: format(new Date(), "yyyy-MM-dd"),
    scheduled_time: "",
    status: "planned",
    priority: "medium",
    notes: "",
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, currentWeek]);

  const fetchItems = async () => {
    if (!user) return;
    
    try {
      const start = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const end = format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("content_calendar")
        .select("*")
        .eq("user_id", user.id)
        .gte("scheduled_date", start)
        .lte("scheduled_date", end)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching calendar items:", error);
      toast.error("Failed to load calendar items");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      const itemData = {
        user_id: user.id,
        title: formData.title.trim(),
        content: formData.content || null,
        content_type: formData.content_type,
        platform: formData.platform,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time || null,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes || null,
        tags: [],
      };

      if (editingItem) {
        const { error } = await supabase
          .from("content_calendar")
          .update(itemData)
          .eq("id", editingItem.id);
        if (error) throw error;
        toast.success("Content updated!");
      } else {
        const { error } = await supabase
          .from("content_calendar")
          .insert(itemData);
        if (error) throw error;
        toast.success("Content scheduled!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save content");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("content_calendar")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Content deleted");
      fetchItems();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("content_calendar")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      content_type: "idea",
      platform: "youtube",
      scheduled_date: format(new Date(), "yyyy-MM-dd"),
      scheduled_time: "",
      status: "planned",
      priority: "medium",
      notes: "",
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: CalendarItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content || "",
      content_type: item.content_type,
      platform: item.platform,
      scheduled_date: item.scheduled_date,
      scheduled_time: item.scheduled_time || "",
      status: item.status,
      priority: item.priority,
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = (date?: Date) => {
    resetForm();
    if (date) {
      setFormData(prev => ({ ...prev, scheduled_date: format(date, "yyyy-MM-dd") }));
    }
    setIsDialogOpen(true);
  };

  const getItemsForDay = (date: Date) => {
    return items.filter(item => isSameDay(parseISO(item.scheduled_date), date));
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "script": return FileText;
      case "idea": return Lightbulb;
      case "video": return Video;
      default: return FileText;
    }
  };

  if (!user) {
    return (
      <div className="px-4 py-6">
        <Card className="p-6 text-center">
          <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Sign in Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to use the Content Calendar</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Content Calendar</h1>
              <p className="text-xs text-muted-foreground">Plan & schedule your content</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => openNewDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Content" : "Schedule New Content"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Title</label>
                  <Input
                    placeholder="Content title..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Platform</label>
                    <Select value={formData.platform} onValueChange={(v) => setFormData(prev => ({ ...prev, platform: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="shorts">YT Shorts</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="reels">Reels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Type</label>
                    <Select value={formData.content_type} onValueChange={(v) => setFormData(prev => ({ ...prev, content_type: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea</SelectItem>
                        <SelectItem value="script">Script</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Date</label>
                    <Input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Time (optional)</label>
                    <Input
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Status</label>
                    <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Priority</label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Content / Script</label>
                  <Textarea
                    placeholder="Add your content, script, or idea details..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Notes</label>
                  <Textarea
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit}>
                    {editingItem ? "Update" : "Schedule"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="font-semibold">
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </p>
            <Button variant="link" size="sm" className="text-xs text-primary p-0 h-auto" onClick={() => setCurrentWeek(new Date())}>
              Go to Today
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Week Grid */}
        <div className="space-y-3">
          {weekDays.map((day) => {
            const dayItems = getItemsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Card
                key={day.toISOString()}
                variant={isToday ? "glow" : "gradient"}
                className={`p-3 ${isToday ? "border-primary/50" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${isToday ? "gradient-primary" : "bg-muted"}`}>
                      <span className="text-xs font-medium">{format(day, "EEE")}</span>
                      <span className="text-sm font-bold">{format(day, "d")}</span>
                    </div>
                    {dayItems.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayItems.length} item{dayItems.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openNewDialog(day)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {dayItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">No content scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {dayItems.map((item) => {
                      const PlatformIcon = platformIcons[item.platform] || Youtube;
                      const ContentIcon = getContentTypeIcon(item.content_type);
                      
                      return (
                        <div
                          key={item.id}
                          className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 rounded bg-primary/20">
                              <PlatformIcon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <h4 className="text-sm font-medium truncate">{item.title}</h4>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={`text-[10px] px-1.5 ${statusColors[item.status]}`}>
                                  {item.status}
                                </Badge>
                                <Badge variant="outline" className={`text-[10px] px-1.5 ${priorityColors[item.priority]}`}>
                                  {item.priority}
                                </Badge>
                                {item.scheduled_time && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" />
                                    {item.scheduled_time}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(item)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
