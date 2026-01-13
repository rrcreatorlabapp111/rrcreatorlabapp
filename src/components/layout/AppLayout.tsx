import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
      
      {/* Noise texture overlay */}
      <div className="noise-overlay" aria-hidden="true" />
      
      {/* Grid pattern */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" aria-hidden="true" />
      
      {/* Main content */}
      <main className="relative z-10 safe-bottom">{children}</main>
      <BottomNav />
    </div>
  );
};
