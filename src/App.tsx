import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { AppLayout } from "@/components/layout/AppLayout";
import { SplashScreen } from "@/pages/SplashScreen";
import { HomePage } from "@/pages/HomePage";
import { ToolsPage } from "@/pages/ToolsPage";
import { TipsPage } from "@/pages/TipsPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AuthPage } from "@/pages/AuthPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdminPage } from "@/pages/AdminPage";
import { TutorialsPage } from "@/pages/TutorialsPage";
import { YouTubeAssistantPage } from "@/pages/YouTubeAssistantPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { TagGeneratorPage } from "@/pages/tools/TagGeneratorPage";
import { ScriptGeneratorPage } from "@/pages/tools/ScriptGeneratorPage";
import { TextToScriptPage } from "@/pages/tools/TextToScriptPage";
import { ShortsIdeasPage } from "@/pages/tools/ShortsIdeasPage";
import { YouTubePlannerPage } from "@/pages/tools/YouTubePlannerPage";
import { GrowthCalculatorPage } from "@/pages/tools/GrowthCalculatorPage";
import { WatchTimeEstimatorPage } from "@/pages/tools/WatchTimeEstimatorPage";
import { EngagementAnalyzerPage } from "@/pages/tools/EngagementAnalyzerPage";
import { GrowthPredictorPage } from "@/pages/tools/GrowthPredictorPage";
import { TrendingTopicsPage } from "@/pages/tools/TrendingTopicsPage";
import { SEOScorePage } from "@/pages/tools/SEOScorePage";
import { CompetitorAnalysisPage } from "@/pages/tools/CompetitorAnalysisPage";
import { TitleTesterPage } from "@/pages/tools/TitleTesterPage";
import { BestPostingTimePage } from "@/pages/tools/BestPostingTimePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { needsOnboarding, loading } = useOnboarding();
  const location = useLocation();

  // Don't redirect if on auth or onboarding pages
  const isAuthPage = location.pathname === "/auth";
  const isOnboardingPage = location.pathname === "/onboarding";

  if (loading) return null;

  if (needsOnboarding && !isAuthPage && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
          <BrowserRouter>
            <OnboardingGuard>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/tutorials" element={<TutorialsPage />} />
                  <Route path="/youtube-assistant" element={<YouTubeAssistantPage />} />
                  <Route path="/tools" element={<ToolsPage />} />
                  <Route path="/tips" element={<TipsPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/tools/tags" element={<TagGeneratorPage />} />
                  <Route path="/tools/script" element={<ScriptGeneratorPage />} />
                  <Route path="/tools/text-script" element={<TextToScriptPage />} />
                  <Route path="/tools/shorts-ideas" element={<ShortsIdeasPage />} />
                  <Route path="/tools/planner" element={<YouTubePlannerPage />} />
                  <Route path="/tools/growth-calc" element={<GrowthCalculatorPage />} />
                  <Route path="/tools/watch-time" element={<WatchTimeEstimatorPage />} />
                  <Route path="/tools/engagement" element={<EngagementAnalyzerPage />} />
                  <Route path="/tools/growth-predict" element={<GrowthPredictorPage />} />
                  <Route path="/tools/trending" element={<TrendingTopicsPage />} />
                  <Route path="/tools/seo" element={<SEOScorePage />} />
                  <Route path="/tools/competitor" element={<CompetitorAnalysisPage />} />
                  <Route path="/tools/title-test" element={<TitleTesterPage />} />
                  <Route path="/tools/best-time" element={<BestPostingTimePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </OnboardingGuard>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
