import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, UserPlus, Users, Shield, Trash2, Mail, Loader2, 
  Clock, CheckCircle, XCircle, Settings, Activity, Pencil, Eye, EyeOff,
  Lock, Key
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  user_id: string;
  invited_by: string | null;
  name: string;
  email: string;
  role: string;
  position: string | null;
  avatar_url: string | null;
  status: string;
  permissions: string[];
  skills: string[];
  created_at: string;
}

interface AdminSettings {
  signup_code: string;
  session_timeout: string;
  max_login_attempts: string;
  min_password_length: string;
  require_uppercase: string;
  require_number: string;
}

interface AdminLog {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "view_dashboard", label: "View Dashboard" },
  { id: "view_analytics", label: "View Analytics" },
  { id: "use_tools", label: "Use Creator Tools" },
  { id: "view_tutorials", label: "View Tutorials" },
  { id: "manage_content", label: "Manage Content" },
  { id: "youtube_assistant", label: "YouTube Assistant" },
];

export const TeamPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    signup_code: '',
    session_timeout: '180',
    max_login_attempts: '6',
    min_password_length: '8',
    require_uppercase: 'true',
    require_number: 'true',
  });
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSignupCode, setShowSignupCode] = useState(false);
  const [activeTab, setActiveTab] = useState("team");
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [position, setPosition] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["view_dashboard", "view_tutorials"]);
  const [skills, setSkills] = useState("");

  // Settings form state
  const [newSignupCode, setNewSignupCode] = useState("");
  const [newSessionTimeout, setNewSessionTimeout] = useState("");
  const [newMaxLoginAttempts, setNewMaxLoginAttempts] = useState("");
  const [newPasswordLength, setNewPasswordLength] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else {
        fetchAllData();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchTeamMembers(),
      fetchUserRoles(),
      fetchAdminSettings(),
      fetchAdminLogs(),
    ]);
    setLoading(false);
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const parsedMembers: TeamMember[] = (data || []).map(member => ({
        ...member,
        permissions: Array.isArray(member.permissions) 
          ? (member.permissions as unknown as string[])
          : [],
        skills: Array.isArray(member.skills) 
          ? (member.skills as unknown as string[])
          : []
      }));
      
      setTeamMembers(parsedMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*");

      if (error) throw error;
      
      const settings: AdminSettings = { ...adminSettings };
      data?.forEach(row => {
        if (row.setting_key in settings) {
          (settings as any)[row.setting_key] = row.setting_value;
        }
      });
      setAdminSettings(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAdminLogs(data || []);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
    }
  };

  const logAction = async (action: string, details?: string) => {
    if (!user) return;
    try {
      await supabase.from("admin_logs").insert({
        user_id: user.id,
        action,
        details,
      });
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
      
      const { error } = await supabase.from("team_members").insert({
        user_id: user.id,
        invited_by: user.id,
        name,
        email,
        role,
        position: position || null,
        permissions,
        skills: skillsArray,
        status: "pending",
      });

      if (error) throw error;

      await logAction("Invited team member", `${name} (${email}) as ${role}`);
      toast.success(`Invitation sent to ${email}`);
      setDialogOpen(false);
      resetForm();
      fetchTeamMembers();
      fetchAdminLogs();
    } catch (error: any) {
      console.error("Error inviting member:", error);
      if (error.code === "23505") {
        toast.error("This email has already been invited");
      } else {
        toast.error("Failed to send invitation");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setSubmitting(true);
    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from("team_members")
        .update({
          name,
          email,
          role,
          position: position || null,
          permissions,
          skills: skillsArray,
        })
        .eq("id", editingMember.id);

      if (error) throw error;

      await logAction("Updated team member", `${name} (${email})`);
      toast.success("Team member updated");
      setEditDialogOpen(false);
      resetForm();
      fetchTeamMembers();
      fetchAdminLogs();
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update team member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await logAction("Removed team member", memberName);
      toast.success("Team member removed");
      fetchTeamMembers();
      fetchAdminLogs();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const handleApprove = async (id: string, memberName: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ status: "active" })
        .eq("id", id);

      if (error) throw error;
      await logAction("Approved team member", memberName);
      toast.success("Team member approved");
      fetchTeamMembers();
      fetchAdminLogs();
    } catch (error) {
      console.error("Error approving member:", error);
      toast.error("Failed to approve team member");
    }
  };

  const handleReject = async (id: string, memberName: string) => {
    if (!confirm(`Reject ${memberName}'s registration?`)) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await logAction("Rejected team member", memberName);
      toast.success("Registration rejected");
      fetchTeamMembers();
      fetchAdminLogs();
    } catch (error) {
      console.error("Error rejecting member:", error);
      toast.error("Failed to reject registration");
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from("admin_settings")
        .update({ setting_value: value, updated_at: new Date().toISOString(), updated_by: user?.id })
        .eq("setting_key", key);

      if (error) throw error;
      await logAction("Updated setting", `${key} = ${key === 'signup_code' ? '******' : value}`);
      toast.success("Setting updated");
      fetchAdminSettings();
      fetchAdminLogs();
    } catch (error) {
      console.error("Error updating setting:", error);
      toast.error("Failed to update setting");
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setPosition(member.position || "");
    setPermissions(member.permissions);
    setSkills(member.skills.join(", "));
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("employee");
    setPosition("");
    setPermissions(["view_dashboard", "view_tutorials"]);
    setSkills("");
    setEditingMember(null);
  };

  const togglePermission = (permId: string) => {
    setPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-destructive/10 text-destructive border-destructive/30";
      case "moderator": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "employee": return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const activeMembers = teamMembers.filter(m => m.status === "active");
  const pendingMembers = teamMembers.filter(m => m.status === "pending");
  const admins = userRoles.filter(r => r.role === "admin");
  const moderators = userRoles.filter(r => r.role === "moderator");

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {isAdmin ? "Admin Dashboard" : "Team Members"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isAdmin ? "Manage your team and settings" : `${activeMembers.length} active • ${pendingMembers.length} pending`}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Badge variant="outline" className="ml-auto border-primary text-primary">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>

        {/* Stats Cards - Admin Only */}
        {isAdmin && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                  <p className="text-xs text-muted-foreground">Team Members</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingMembers.length}</p>
                  <p className="text-xs text-muted-foreground">Pending Approvals</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Active</p>
                  <p className="text-xs text-muted-foreground">System Status</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Secure</p>
                  <p className="text-xs text-muted-foreground">RLS Enabled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs - Full Admin View */}
        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/50 border border-border/50 p-1">
              <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-primary/10">
                <Users className="h-4 w-4" />
                My Team
              </TabsTrigger>
              <TabsTrigger value="approvals" className="gap-2 data-[state=active]:bg-primary/10">
                <Clock className="h-4 w-4" />
                Approvals
                {pendingMembers.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {pendingMembers.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-2 data-[state=active]:bg-primary/10">
                <Shield className="h-4 w-4" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary/10">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-primary/10">
                <Activity className="h-4 w-4" />
                Logs
              </TabsTrigger>
            </TabsList>

            {/* My Team Tab */}
            <TabsContent value="team" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  My Team
                </h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-green-600 hover:bg-green-700">
                      <UserPlus className="h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInviteMember} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Founder and CEO, Video Editor, etc." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills/Tags (comma-separated)</Label>
                        <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Management, Marketing, Sales" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {AVAILABLE_PERMISSIONS.map((perm) => (
                            <div key={perm.id} className="flex items-center space-x-2">
                              <Checkbox id={perm.id} checked={permissions.includes(perm.id)} onCheckedChange={() => togglePermission(perm.id)} />
                              <label htmlFor={perm.id} className="text-sm cursor-pointer">{perm.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="h-4 w-4 mr-2" />Add Member</>}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Team Member Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMembers.map((member) => (
                  <Card key={member.id} className="relative overflow-hidden bg-card/50 border-border/50">
                    {/* Edit/Delete buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-background/80 hover:bg-background" onClick={() => openEditDialog(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeleteMember(member.id, member.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Avatar area */}
                    <div className="h-48 bg-gradient-to-b from-primary/5 to-transparent flex items-center justify-center">
                      <Avatar className="h-32 w-32 border-4 border-background">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-4xl bg-muted">
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <CardContent className="p-4 pt-2">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-sm text-primary">{member.position || member.role}</p>
                      
                      {member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {member.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="bg-primary/20 text-primary text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {activeMembers.length === 0 && (
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active team members yet</p>
                    <p className="text-sm">Add your first team member to get started</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Approvals Tab */}
            <TabsContent value="approvals" className="space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription>Review and approve new team member registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                      <p>No pending approvals</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg border bg-background/50">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("").toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Registered {new Date(member.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => handleApprove(member.id, member.name)}>
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleReject(member.id, member.name)}>
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-destructive" />
                    Administrators
                  </CardTitle>
                  <CardDescription>Users with full access to manage the system</CardDescription>
                </CardHeader>
                <CardContent>
                  {admins.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No administrators found</p>
                  ) : (
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <div key={admin.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{admin.user_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">User</p>
                          </div>
                          <Badge className={getRoleColor('admin')}>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                          {admin.user_id === user?.id && (
                            <Badge variant="outline">You</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Regular team members with standard access</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeMembers.filter(m => m.role !== 'admin').length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No regular members found</p>
                  ) : (
                    <div className="space-y-2">
                      {activeMembers.filter(m => m.role !== 'admin').map((member) => (
                        <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("").toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.position || member.email}</p>
                          </div>
                          <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Admin Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Signup Code */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4 text-yellow-500" />
                      Signup Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Current:</span>
                      <span className="font-mono">{showSignupCode ? adminSettings.signup_code : '••••••'}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowSignupCode(!showSignupCode)}>
                        {showSignupCode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="New code" value={newSignupCode} onChange={(e) => setNewSignupCode(e.target.value)} />
                      <Button onClick={() => { updateSetting('signup_code', newSignupCode); setNewSignupCode(''); }} disabled={!newSignupCode}>
                        Update
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Required for new registrations</p>
                  </CardContent>
                </Card>

                {/* Session Timeout */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Session Timeout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Current:</span>
                      <span className="font-bold">{adminSettings.session_timeout} minutes</span>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Minutes" type="number" value={newSessionTimeout} onChange={(e) => setNewSessionTimeout(e.target.value)} />
                      <Button onClick={() => { updateSetting('session_timeout', newSessionTimeout); setNewSessionTimeout(''); }} disabled={!newSessionTimeout}>
                        Update
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Auto-logout after inactivity (5-1440 min)</p>
                  </CardContent>
                </Card>

                {/* Max Login Attempts */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      Max Login Attempts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Current:</span>
                      <span className="font-bold">{adminSettings.max_login_attempts} attempts</span>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Attempts" type="number" value={newMaxLoginAttempts} onChange={(e) => setNewMaxLoginAttempts(e.target.value)} />
                      <Button onClick={() => { updateSetting('max_login_attempts', newMaxLoginAttempts); setNewMaxLoginAttempts(''); }} disabled={!newMaxLoginAttempts}>
                        Update
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Failed attempts before lockout (1-10)</p>
                  </CardContent>
                </Card>

                {/* Password Requirements */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Key className="h-4 w-4 text-purple-500" />
                      Password Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Min length:</span>
                      <span className="font-bold">{adminSettings.min_password_length} chars</span>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Length" type="number" value={newPasswordLength} onChange={(e) => setNewPasswordLength(e.target.value)} />
                      <Button onClick={() => { updateSetting('min_password_length', newPasswordLength); setNewPasswordLength(''); }} disabled={!newPasswordLength}>
                        Update
                      </Button>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm">Require uppercase</span>
                      <Switch 
                        checked={adminSettings.require_uppercase === 'true'} 
                        onCheckedChange={(checked) => updateSetting('require_uppercase', checked.toString())} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require number</span>
                      <Switch 
                        checked={adminSettings.require_number === 'true'} 
                        onCheckedChange={(checked) => updateSetting('require_number', checked.toString())} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Admin Activity Logs
                  </CardTitle>
                  <CardDescription>Recent administrative actions</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No activity logs yet</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {adminLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border text-sm">
                          <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{log.action}</p>
                            {log.details && <p className="text-muted-foreground">{log.details}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          /* Non-admin view - just show active team members */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden bg-card/50 border-border/50">
                <div className="h-48 bg-gradient-to-b from-primary/5 to-transparent flex items-center justify-center">
                  <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="text-4xl bg-muted">
                      {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardContent className="p-4 pt-2">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-primary">{member.position || member.role}</p>
                  {member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {member.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="bg-primary/20 text-primary text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {activeMembers.length === 0 && (
              <Card className="col-span-full bg-card/50 border-border/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Edit Member Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-position">Position</Label>
                <Input id="edit-position" value={position} onChange={(e) => setPosition(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-skills">Skills/Tags (comma-separated)</Label>
                <Input id="edit-skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox id={`edit-${perm.id}`} checked={permissions.includes(perm.id)} onCheckedChange={() => togglePermission(perm.id)} />
                      <label htmlFor={`edit-${perm.id}`} className="text-sm cursor-pointer">{perm.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
