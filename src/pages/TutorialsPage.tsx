import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTutorials, Tutorial } from "@/lib/tutorials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, FileText, ArrowLeft, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterType = "all" | "video" | "article";

export const TutorialsPage = () => {
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["tutorials"],
    queryFn: getTutorials,
  });

  const filteredTutorials = tutorials?.filter((tutorial) => {
    if (filter === "all") return true;
    return tutorial.type === filter;
  });

  const filterLabels: Record<FilterType, string> = {
    all: "All Tutorials",
    video: "Videos Only",
    article: "Articles Only",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tutorials</h1>
              <p className="text-sm text-muted-foreground">
                Learn and grow your channel
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {filterLabels[filter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Tutorials
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("video")}>
                <Play className="h-4 w-4 mr-2" />
                Videos Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("article")}>
                <FileText className="h-4 w-4 mr-2" />
                Articles Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        {tutorials && (
          <div className="flex gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              {tutorials.filter((t) => t.type === "video").length} Videos
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              {tutorials.filter((t) => t.type === "article").length} Articles
            </Badge>
          </div>
        )}

        {/* Tutorials Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-40 rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredTutorials && filteredTutorials.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {filter === "all"
                ? "No tutorials available yet."
                : `No ${filter}s available yet.`}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

const TutorialCard = ({ tutorial }: { tutorial: Tutorial }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {tutorial.thumbnail_url && (
        <div className="relative aspect-video bg-muted">
          <img
            src={tutorial.thumbnail_url}
            alt={tutorial.title}
            className="w-full h-full object-cover"
          />
          {tutorial.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-primary/90 rounded-full p-3">
                <Play className="h-6 w-6 text-primary-foreground fill-current" />
              </div>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{tutorial.title}</CardTitle>
          <Badge variant={tutorial.type === "video" ? "default" : "secondary"}>
            {tutorial.type === "video" ? (
              <Play className="h-3 w-3 mr-1" />
            ) : (
              <FileText className="h-3 w-3 mr-1" />
            )}
            {tutorial.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tutorial.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tutorial.description}
          </p>
        )}

        {tutorial.type === "video" && tutorial.video_url ? (
          <Button asChild className="w-full" size="sm">
            <a href={tutorial.video_url} target="_blank" rel="noopener noreferrer">
              <Play className="h-4 w-4 mr-2" />
              Watch Video
            </a>
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isExpanded ? "Hide Content" : "Read Article"}
            </Button>
            {isExpanded && (
              <div className="pt-3 border-t">
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: tutorial.content }}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
