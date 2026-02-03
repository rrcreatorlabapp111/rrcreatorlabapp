import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, User, ArrowLeft, Key } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
    } catch {
      toast.error("Please enter a valid email address");
      return false;
    }

    try {
      passwordSchema.parse(password);
    } catch {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const validateSignupCode = async (): Promise<boolean> => {
    if (!signupCode.trim()) {
      toast.error("Signup code is required");
      return false;
    }

    const { data, error } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "signup_code")
      .single();

    if (error || !data) {
      toast.error("Unable to verify signup code. Please try again.");
      return false;
    }

    if (data.setting_value !== signupCode.trim()) {
      toast.error("Invalid signup code. Please contact an admin.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/");
        }
      } else {
        // Validate signup code before allowing signup
        const isValidCode = await validateSignupCode();
        if (!isValidCode) {
          setIsLoading(false);
          return;
        }

        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: displayName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else if (data.user) {
          // Create team_member entry with pending status
          const { error: memberError } = await supabase
            .from("team_members")
            .insert({
              user_id: data.user.id,
              name: displayName || email.split("@")[0],
              email: email,
              role: "member",
              status: "pending",
            });

          if (memberError) {
            console.error("Error creating team member:", memberError);
          }

          toast.success("Account created! Waiting for admin approval.");
          navigate("/pending-approval");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-glow">
          <Sparkles className="h-8 w-8 text-foreground" />
        </div>
        <h1 className="text-2xl font-bold gradient-text">RR Creator Labs</h1>
        <p className="text-muted-foreground mt-1">
          {isLogin ? "Welcome back, creator!" : "Join the creator community"}
        </p>
      </div>

      <Card variant="gradient" className="w-full max-w-sm p-6 animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="signupCode">Signup Code *</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signupCode"
                    type="text"
                    placeholder="Enter signup code"
                    value={signupCode}
                    onChange={(e) => setSignupCode(e.target.value)}
                    className="pl-10 bg-muted border-border"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Contact an admin to get your signup code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 bg-muted border-border"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-muted border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-muted border-border"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-foreground border-t-transparent rounded-full" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
};
