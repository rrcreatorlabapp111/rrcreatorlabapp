import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings,
  Shield
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Tutorials", icon: BookOpen },
  { href: "/team", label: "Team", icon: Users },
];

export const AdminNav = () => {
  const location = useLocation();

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg mb-4">
      <Shield className="h-4 w-4 text-primary ml-2" />
      <span className="text-sm font-medium mr-2">Admin:</span>
      {adminLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.href;
        
        return (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
};
