import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center animate-fade-in">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
            <Sparkles className="h-12 w-12 text-foreground" />
          </div>
          <div className="absolute -inset-4 rounded-3xl gradient-glow blur-xl opacity-50" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">RR Creator Labs</h1>
        <p className="text-muted-foreground">Grow Your Content. Build Your Brand.</p>
        
        <div className="mt-8 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full gradient-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
