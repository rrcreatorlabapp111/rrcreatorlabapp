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

import { DashboardPage } from "@/pages/DashboardPage";
import { AuthPage } from "@/pages/AuthPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdminPage } from "@/pages/AdminPage";
import { TeamPage } from "@/pages/TeamPage";
import { TutorialsPage } from "@/pages/TutorialsPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { ContentCalendarPage } from "@/pages/ContentCalendarPage";
import { SavedContentPage } from "@/pages/SavedContentPage";
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
import { ThumbnailIdeasPage } from "@/pages/tools/ThumbnailIdeasPage";
import { VideoHooksPage } from "@/pages/tools/VideoHooksPage";
import { RevenueCalculatorPage } from "@/pages/tools/RevenueCalculatorPage";
import { DescriptionGeneratorPage } from "@/pages/tools/DescriptionGeneratorPage";
import { CaptionGeneratorPage } from "@/pages/tools/CaptionGeneratorPage";
import { StoryIdeasPage } from "@/pages/tools/StoryIdeasPage";
import { BioGeneratorPage } from "@/pages/tools/BioGeneratorPage";
import { IGEngagementPage } from "@/pages/tools/IGEngagementPage";
import { ReelIdeasPage } from "@/pages/tools/ReelIdeasPage";
import { ReelScriptPage } from "@/pages/tools/ReelScriptPage";
import { HashtagGeneratorPage } from "@/pages/tools/HashtagGeneratorPage";
import { IGContentCalendarPage } from "@/pages/tools/IGContentCalendarPage";
import { IGHookGeneratorPage } from "@/pages/tools/IGHookGeneratorPage";
import { IGGrowthStrategyPage } from "@/pages/tools/IGGrowthStrategyPage";
import { IGMonetizationPage } from "@/pages/tools/IGMonetizationPage";
import { CarouselPlannerPage } from "@/pages/tools/CarouselPlannerPage";
import { ContentPillarsPage } from "@/pages/tools/ContentPillarsPage";
import { CollabIdeasPage } from "@/pages/tools/CollabIdeasPage";
import { ReachEstimatorPage } from "@/pages/tools/ReachEstimatorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { needsOnboarding, loading } = useOnboarding();
  const location = useLocation();

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
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/tutorials" element={<TutorialsPage />} />
                  <Route path="/content-calendar" element={<ContentCalendarPage />} />
                  <Route path="/saved-content" element={<SavedContentPage />} />
                  <Route path="/tools" element={<ToolsPage />} />
                  <Route path="/tips" element={<TipsPage />} />
                  
                  {/* YouTube Tools */}
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
                  <Route path="/tools/thumbnail-ideas" element={<ThumbnailIdeasPage />} />
                  <Route path="/tools/video-hooks" element={<VideoHooksPage />} />
                  <Route path="/tools/revenue-calc" element={<RevenueCalculatorPage />} />
                  <Route path="/tools/description-gen" element={<DescriptionGeneratorPage />} />
                  {/* Instagram Tools */}
                  <Route path="/tools/caption-gen" element={<CaptionGeneratorPage />} />
                  <Route path="/tools/story-ideas" element={<StoryIdeasPage />} />
                  <Route path="/tools/bio-gen" element={<BioGeneratorPage />} />
                  <Route path="/tools/ig-engagement" element={<IGEngagementPage />} />
                  <Route path="/tools/reel-ideas" element={<ReelIdeasPage />} />
                  <Route path="/tools/reel-script" element={<ReelScriptPage />} />
                  <Route path="/tools/hashtag-gen" element={<HashtagGeneratorPage />} />
                  <Route path="/tools/ig-calendar" element={<IGContentCalendarPage />} />
                  <Route path="/tools/ig-hooks" element={<IGHookGeneratorPage />} />
                  <Route path="/tools/ig-growth" element={<IGGrowthStrategyPage />} />
                  <Route path="/tools/ig-monetization" element={<IGMonetizationPage />} />
                  <Route path="/tools/carousel-planner" element={<CarouselPlannerPage />} />
                  <Route path="/tools/content-pillars" element={<ContentPillarsPage />} />
                  <Route path="/tools/collab-ideas" element={<CollabIdeasPage />} />
                  <Route path="/tools/reach-estimator" element={<ReachEstimatorPage />} />
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
