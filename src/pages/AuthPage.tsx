import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, User, Key, Eye, EyeOff, Rocket, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const features = [
  { icon: Rocket, text: "AI-Powered Tools" },
  { icon: Shield, text: "Exclusive Access" },
  { icon: Users, text: "Creator Community" },
];

export const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb orb-1 pointer-events-none" aria-hidden="true" />
      <div className="orb orb-2 pointer-events-none" aria-hidden="true" />
      <div className="orb orb-3 pointer-events-none" aria-hidden="true" />
      
      {/* Noise texture overlay */}
      <div className="noise-overlay pointer-events-none" aria-hidden="true" />
      
      {/* Grid pattern */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" aria-hidden="true" />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo & Branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-primary mb-6 shadow-glow animate-pulse-glow">
            <Sparkles className="h-10 w-10 text-foreground" />
            <div className="absolute inset-0 rounded-3xl gradient-primary opacity-50 blur-xl" />
          </div>
          <h1 className="text-3xl font-bold font-display gradient-text mb-2">RR Creator Labs</h1>
          <p className="text-muted-foreground text-base">
            {isLogin ? "Welcome back, creator!" : "Join the creator community"}
          </p>
        </div>

        {/* Feature badges - only show on signup */}
        {!isLogin && (
          <div className="flex flex-wrap justify-center gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {features.map((feature, index) => (
              <div
                key={feature.text}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-border/50 text-sm"
                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
              >
                <feature.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">{feature.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Auth Card */}
        <Card 
          variant="glass" 
          className="w-full max-w-sm p-6 animate-slide-up border-gradient"
          style={{ animationDelay: "0.2s" }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                {/* Signup Code Field */}
                <div className="space-y-2">
                  <Label htmlFor="signupCode" className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    Signup Code
                  </Label>
                  <div className="relative group">
                    <Input
                      id="signupCode"
                      type="text"
                      placeholder="Enter your exclusive code"
                      value={signupCode}
                      onChange={(e) => setSignupCode(e.target.value)}
                      className="bg-muted/50 border-border/50 h-12 text-base transition-all duration-300 focus:border-primary/50 focus:bg-muted"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Contact admin for your access code
                  </p>
                </div>

                {/* Display Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" />
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="How should we call you?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-muted/50 border-border/50 h-12 text-base transition-all duration-300 focus:border-primary/50 focus:bg-muted"
                  />
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/50 border-border/50 h-12 text-base transition-all duration-300 focus:border-primary/50 focus:bg-muted"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-primary" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50 border-border/50 h-12 text-base pr-12 transition-all duration-300 focus:border-primary/50 focus:bg-muted"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full h-12 text-base font-semibold relative overflow-hidden group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-foreground border-t-transparent rounded-full" />
                  <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">{isLogin ? "Sign In" : "Create Account"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Toggle Login/Signup */}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setSignupCode("");
              setDisplayName("");
            }}
            className="w-full py-3 px-4 rounded-xl border border-border/50 bg-muted/30 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted/50 transition-all duration-300"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-xs text-muted-foreground/60 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};
