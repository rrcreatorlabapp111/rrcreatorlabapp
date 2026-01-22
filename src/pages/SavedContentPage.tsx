import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Filter, Trash2, Eye, Copy, FileText, Hash, Lightbulb, Calendar, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { getSavedContent, deleteSavedContent } from "@/lib/database";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const typeIcons = {
  script: FileText,
  tags: Hash,
  ideas: Lightbulb,
  plan: Calendar,
  caption: FileText,
  bio: FileText,
  hashtags: Hash,
  hooks: Lightbulb,
  description: FileText,
  reel: FileText,
};

const typeColors = {
  script: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  tags: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  ideas: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  plan: "bg-green-500/20 text-green-400 border-green-500/30",
  caption: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  bio: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  hashtags: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  hooks: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  description: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  reel: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

export const SavedContentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: savedContent = [], isLoading } = useQuery({
    queryKey: ["saved-content", user?.id],
    queryFn: () => getSavedContent(user!.id),
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSavedContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-content"] });
      toast({ title: "Content deleted", description: "The content has been removed from your library." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete content.", variant: "destructive" });
    },
  });

  const filteredContent = savedContent.filter((item: any) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const contentTypes = [...new Set(savedContent.map((item: any) => item.type))];

  const handleView = (item: any) => {
    setSelectedContent(item);
    setIsViewDialogOpen(true);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getIcon = (type: string) => {
    return typeIcons[type as keyof typeof typeIcons] || FileText;
  };

  const getTypeColor = (type: string) => {
    return typeColors[type as keyof typeof typeColors] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card variant="gradient" className="p-6 text-center max-w-md">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to view your saved content library.</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Content Library</h1>
              <p className="text-sm text-muted-foreground">{filteredContent.length} items saved</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {contentTypes.map((type: string) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} variant="gradient" className="p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : filteredContent.length === 0 ? (
          <Card variant="gradient" className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start generating content to save it here"}
            </p>
            <Button onClick={() => navigate("/tools")}>Explore Tools</Button>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredContent.map((item: any) => {
              const Icon = getIcon(item.type);
              return (
                <Card
                  key={item.id}
                  variant="gradient"
                  className="p-4 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => handleView(item)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", getTypeColor(item.type))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {item.title}
                        </h4>
                        <Badge variant="outline" className="shrink-0 capitalize text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {item.preview || item.content?.substring(0, 100)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContent.map((item: any) => {
              const Icon = getIcon(item.type);
              return (
                <Card
                  key={item.id}
                  variant="gradient"
                  className="p-3 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", getTypeColor(item.type))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(item);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(item.content);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
            <DialogDescription>
              <Badge variant="outline" className="capitalize mt-1">
                {selectedContent?.type}
              </Badge>
              <span className="ml-2 text-xs">
                {selectedContent && format(new Date(selectedContent.created_at), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
              {selectedContent?.content}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1"
                onClick={() => handleCopy(selectedContent?.content)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(selectedContent?.id);
                  setIsViewDialogOpen(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
