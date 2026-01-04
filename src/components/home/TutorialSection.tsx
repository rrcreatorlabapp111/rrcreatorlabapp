import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Video, FileText, Play, BookOpen, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTutorials, Tutorial } from "@/lib/tutorials";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const TutorialSection = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const data = await getTutorials();
        setTutorials(data);
      } catch (error) {
        console.error("Error fetching tutorials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Creator Tutorials</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="p-3 animate-pulse">
              <div className="aspect-video bg-muted rounded-md mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (tutorials.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Creator Tutorials</h2>
          </div>
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={() => navigate("/admin")}
            >
              <Settings className="h-4 w-4" />
              Manage
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {tutorials.slice(0, 4).map((tutorial) => (
            <Card 
              key={tutorial.id} 
              className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => setSelectedTutorial(tutorial)}
            >
              <div className="aspect-video relative bg-gradient-to-br from-primary/20 to-accent/20">
                {tutorial.thumbnail_url ? (
                  <img 
                    src={tutorial.thumbnail_url} 
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {tutorial.type === "video" ? (
                      <Video className="h-8 w-8 text-primary/50" />
                    ) : (
                      <FileText className="h-8 w-8 text-primary/50" />
                    )}
                  </div>
                )}
                {tutorial.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  {tutorial.type === "video" ? (
                    <Video className="h-3 w-3 text-primary" />
                  ) : (
                    <FileText className="h-3 w-3 text-primary" />
                  )}
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {tutorial.type}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-foreground line-clamp-2">
                  {tutorial.title}
                </h3>
              </div>
            </Card>
          ))}
        </div>

        {tutorials.length > 4 && (
          <Button variant="outline" className="w-full" onClick={() => navigate("/tutorials")}>
            View All Tutorials ({tutorials.length})
          </Button>
        )}
      </div>

      {/* Tutorial Detail Dialog */}
      <Dialog open={!!selectedTutorial} onOpenChange={() => setSelectedTutorial(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTutorial?.type === "video" ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
              {selectedTutorial?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTutorial && (
            <div className="space-y-4">
              {selectedTutorial.type === "video" && selectedTutorial.video_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={selectedTutorial.video_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              {selectedTutorial.description && (
                <p className="text-muted-foreground">{selectedTutorial.description}</p>
              )}
              
              <div className="prose prose-sm max-w-none text-foreground">
                {selectedTutorial.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
