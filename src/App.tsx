import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SplashScreen } from "@/pages/SplashScreen";
import { HomePage } from "@/pages/HomePage";
import { ToolsPage } from "@/pages/ToolsPage";
import { TipsPage } from "@/pages/TipsPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TagGeneratorPage } from "@/pages/tools/TagGeneratorPage";
import { ScriptGeneratorPage } from "@/pages/tools/ScriptGeneratorPage";
import { TextToScriptPage } from "@/pages/tools/TextToScriptPage";
import { ShortsIdeasPage } from "@/pages/tools/ShortsIdeasPage";
import { YouTubePlannerPage } from "@/pages/tools/YouTubePlannerPage";
import { GrowthCalculatorPage } from "@/pages/tools/GrowthCalculatorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tips" element={<TipsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/tools/tags" element={<TagGeneratorPage />} />
              <Route path="/tools/script" element={<ScriptGeneratorPage />} />
              <Route path="/tools/text-script" element={<TextToScriptPage />} />
              <Route path="/tools/shorts-ideas" element={<ShortsIdeasPage />} />
              <Route path="/tools/planner" element={<YouTubePlannerPage />} />
              <Route path="/tools/growth-calc" element={<GrowthCalculatorPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
