import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Edit, Video, FileText, Eye, EyeOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  getAllTutorials, 
  createTutorial, 
  updateTutorial, 
  deleteTutorial, 
  uploadThumbnail,
  Tutorial,
  TutorialInsert 
} from "@/lib/tutorials";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"video" | "article">("video");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (!adminLoading && !isAdmin && user) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (isAdmin) {
      fetchTutorials();
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  const fetchTutorials = async () => {
    try {
      const data = await getAllTutorials();
      setTutorials(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tutorials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("video");
    setContent("");
    setVideoUrl("");
    setPublished(true);
    setThumbnailFile(null);
    setEditingTutorial(null);
  };

  const openEditDialog = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setTitle(tutorial.title);
    setDescription(tutorial.description || "");
    setType(tutorial.type);
    setContent(tutorial.content);
    setVideoUrl(tutorial.video_url || "");
    setPublished(tutorial.published);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let thumbnailUrl = editingTutorial?.thumbnail_url || null;

      if (editingTutorial) {
        // Update existing tutorial
        if (thumbnailFile) {
          thumbnailUrl = await uploadThumbnail(thumbnailFile, editingTutorial.id);
        }

        await updateTutorial(editingTutorial.id, {
          title,
          description,
          type,
          content,
          video_url: type === "video" ? videoUrl : null,
          thumbnail_url: thumbnailUrl,
          published,
        });

        toast({
          title: "Success",
          description: "Tutorial updated successfully",
        });
      } else {
        // Create new tutorial
        const newTutorial: TutorialInsert = {
          title,
          description,
          type,
          content,
          video_url: type === "video" ? videoUrl : null,
          created_by: user?.id,
          published,
        };

        const created = await createTutorial(newTutorial);

        if (thumbnailFile) {
          thumbnailUrl = await uploadThumbnail(thumbnailFile, created.id);
          await updateTutorial(created.id, { thumbnail_url: thumbnailUrl });
        }

        toast({
          title: "Success",
          description: "Tutorial created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchTutorials();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save tutorial",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tutorial?")) return;

    try {
      await deleteTutorial(id);
      toast({
        title: "Success",
        description: "Tutorial deleted successfully",
      });
      fetchTutorials();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tutorial",
        variant: "destructive",
      });
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Admin - Tutorials</h1>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Tutorial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTutorial ? "Edit Tutorial" : "Add New Tutorial"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Tutorial title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Brief description"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v: "video" | "article") => setType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video
                        </div>
                      </SelectItem>
                      <SelectItem value="article">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Article
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {type === "video" && (
                  <div className="space-y-2">
                    <Label>Video URL (YouTube embed)</Label>
                    <Input 
                      value={videoUrl} 
                      onChange={(e) => setVideoUrl(e.target.value)} 
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{type === "video" ? "Video Description" : "Article Content"}</Label>
                  <Textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder={type === "video" ? "Describe the video content..." : "Write your article content..."}
                    rows={type === "article" ? 8 : 4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail Image</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Published</Label>
                  <Switch checked={published} onCheckedChange={setPublished} />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting} 
                  className="w-full"
                >
                  {submitting ? "Saving..." : (editingTutorial ? "Update Tutorial" : "Create Tutorial")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tutorials List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tutorials...</div>
        ) : tutorials.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No tutorials yet. Click "Add Tutorial" to create one.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="p-4">
                <div className="flex items-start gap-4">
                  {tutorial.thumbnail_url && (
                    <img 
                      src={tutorial.thumbnail_url} 
                      alt={tutorial.title}
                      className="w-24 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {tutorial.type === "video" ? (
                        <Video className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 text-primary" />
                      )}
                      <h3 className="font-medium text-foreground truncate">{tutorial.title}</h3>
                      {!tutorial.published && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Draft</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {tutorial.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditDialog(tutorial)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(tutorial.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
