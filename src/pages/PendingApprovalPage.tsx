import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut, MessageCircle } from "lucide-react";

export const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleContactAdmin = () => {
    const message = encodeURIComponent(
      `Hi, I just signed up for RR Creator Labs with email: ${user?.email}. Please approve my account.`
    );
    window.open(`https://wa.me/919876543210?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md border-primary/20 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold">Pending Approval</CardTitle>
          <CardDescription className="text-base">
            Your account has been created successfully! An admin will review and approve your access shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Registered email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleContactAdmin} 
              className="w-full gap-2"
              variant="default"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Admin on WhatsApp
            </Button>
            
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            You'll be able to access the app once an admin approves your account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
