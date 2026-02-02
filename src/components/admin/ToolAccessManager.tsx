import { useState, useEffect } from "react";
import { useToolAccessAdmin } from "@/hooks/useToolAccess";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Lock, Unlock, UserPlus, Trash2, Settings, Search, RefreshCw } from "lucide-react";

interface Profile {
  user_id: string;
  display_name: string | null;
}

const ALL_TOOLS = [
  { id: "tag-generator", name: "Tag Generator", category: "YouTube" },
  { id: "script-generator", name: "Script Generator", category: "YouTube" },
  { id: "text-to-script", name: "Text to Script", category: "YouTube" },
  { id: "shorts-ideas", name: "Shorts Ideas", category: "YouTube" },
  { id: "youtube-planner", name: "Content Planner", category: "YouTube" },
  { id: "thumbnail-ideas", name: "Thumbnail Ideas", category: "YouTube" },
  { id: "video-hook", name: "Video Hook Generator", category: "YouTube" },
  { id: "growth-calculator", name: "Growth Calculator", category: "YouTube" },
  { id: "watch-time", name: "Watch Time Estimator", category: "YouTube" },
  { id: "engagement", name: "Engagement Analyzer", category: "YouTube" },
  { id: "growth-predictor", name: "Milestone Predictor", category: "YouTube" },
  { id: "trending", name: "Trending Topics", category: "YouTube" },
  { id: "revenue-calc", name: "Revenue Calculator", category: "YouTube" },
  { id: "seo-score", name: "SEO Score Analyzer", category: "YouTube" },
  { id: "competitor", name: "Competitor Analysis", category: "YouTube" },
  { id: "title-tester", name: "Title A/B Tester", category: "YouTube" },
  { id: "best-time", name: "Best Upload Time", category: "YouTube" },
  { id: "description-gen", name: "Description Generator", category: "YouTube" },
  { id: "hashtag-generator", name: "Hashtag Generator", category: "Instagram" },
  { id: "caption-generator", name: "Caption Generator", category: "Instagram" },
  { id: "reels-ideas", name: "Reels Ideas", category: "Instagram" },
  { id: "story-ideas", name: "Story Ideas", category: "Instagram" },
  { id: "carousel-planner", name: "Carousel Planner", category: "Instagram" },
  { id: "bio-generator", name: "Bio Generator", category: "Instagram" },
  { id: "ig-engagement", name: "IG Engagement Rate", category: "Instagram" },
  { id: "ig-trending", name: "Trending Audio", category: "Instagram" },
  { id: "reach-estimator", name: "Reach Estimator", category: "Instagram" },
  { id: "content-calendar", name: "Content Calendar", category: "Instagram" },
  { id: "collab-finder", name: "Collab Ideas", category: "Instagram" },
  { id: "content-pillars", name: "Content Pillars", category: "Instagram" },
];

export const ToolAccessManager = () => {
  const {
    users: accessList,
    loading,
    fetchUsersWithAccess,
    grantAccess,
    revokeAccess,
    grantAllToolsAccess,
    revokeAllAccess,
    toggleToolsLocked,
  } = useToolAccessAdmin();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [toolsLocked, setToolsLocked] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await fetchUsersWithAccess();
    
    // Fetch all profiles
    const { data: profileData } = await supabase
      .from("profiles")
      .select("user_id, display_name");
    
    if (profileData) {
      setProfiles(profileData);
    }

    // Check tools locked status
    const { data: settings } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "tools_locked")
      .single();
    
    setToolsLocked(settings?.setting_value === "true");
  };

  const handleToggleLocked = async (locked: boolean) => {
    const result = await toggleToolsLocked(locked);
    if (result.success) {
      setToolsLocked(locked);
      toast.success(locked ? "Tools are now locked" : "Tools are now unlocked for everyone");
    } else {
      toast.error("Failed to update setting");
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedUserId || selectedTools.length === 0) {
      toast.error("Please select a user and at least one tool");
      return;
    }

    setIsSubmitting(true);
    const result = await grantAccess(selectedUserId, selectedTools);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Access granted successfully");
      setShowGrantDialog(false);
      setSelectedUserId("");
      setSelectedTools([]);
    } else {
      toast.error("Failed to grant access");
    }
  };

  const handleGrantAll = async (userId: string) => {
    const result = await grantAllToolsAccess(userId);
    if (result.success) {
      toast.success("Full access granted");
    } else {
      toast.error("Failed to grant access");
    }
  };

  const handleRevokeAll = async (userId: string) => {
    const result = await revokeAllAccess(userId);
    if (result.success) {
      toast.success("Access revoked");
    } else {
      toast.error("Failed to revoke access");
    }
  };

  const getProfileName = (userId: string) => {
    const profile = profiles.find((p) => p.user_id === userId);
    return profile?.display_name || "Unknown User";
  };

  // Group access by user
  const userAccessMap = accessList.reduce((acc, item) => {
    if (!acc[item.user_id]) {
      acc[item.user_id] = [];
    }
    acc[item.user_id].push(item.tool_id);
    return acc;
  }, {} as Record<string, string[]>);

  const filteredProfiles = profiles.filter((p) =>
    p.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              {toolsLocked ? (
                <Lock className="h-5 w-5 text-destructive" />
              ) : (
                <Unlock className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">Tool Access Control</h3>
              <p className="text-sm text-muted-foreground">
                {toolsLocked
                  ? "Tools are locked - only users with access can use them"
                  : "Tools are unlocked - everyone can use all tools"}
              </p>
            </div>
          </div>
          <Switch
            checked={toolsLocked}
            onCheckedChange={handleToggleLocked}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowGrantDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Grant Access
        </Button>
        <Button variant="outline" size="icon" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Users with Access */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Tools Access</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(userAccessMap).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No users have tool access yet
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(userAccessMap).map(([userId, tools]) => {
                const toolsArray = tools as string[];
                return (
                  <TableRow key={userId}>
                    <TableCell className="font-medium">
                      {getProfileName(userId)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {toolsArray.length === ALL_TOOLS.length ? (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                            All Tools
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{toolsArray.length} tools</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGrantAll(userId)}
                        >
                          Grant All
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeAll(userId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Grant Access Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Tool Access</DialogTitle>
            <DialogDescription>
              Select a user and the tools they should have access to.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <select
                className="w-full p-2 rounded-md border bg-background"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {filteredProfiles.map((profile) => (
                  <option key={profile.user_id} value={profile.user_id}>
                    {profile.display_name || profile.user_id}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Tools</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedTools(
                      selectedTools.length === ALL_TOOLS.length
                        ? []
                        : ALL_TOOLS.map((t) => t.id)
                    )
                  }
                >
                  {selectedTools.length === ALL_TOOLS.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <ScrollArea className="h-[250px] border rounded-md p-3">
                <div className="space-y-2">
                  {["YouTube", "Instagram"].map((category) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        {category}
                      </h4>
                      {ALL_TOOLS.filter((t) => t.category === category).map(
                        (tool) => (
                          <div
                            key={tool.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={tool.id}
                              checked={selectedTools.includes(tool.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTools([...selectedTools, tool.id]);
                                } else {
                                  setSelectedTools(
                                    selectedTools.filter((t) => t !== tool.id)
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={tool.id} className="text-sm">
                              {tool.name}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrantDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrantAccess} disabled={isSubmitting}>
              {isSubmitting ? "Granting..." : "Grant Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
