import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Home, Package, Calendar, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/machines", label: "Machines", icon: Package },
    { to: "/rentals", label: "Rentals", icon: Calendar },
    ...(userRole === "admin" ? [{ to: "/admin", label: "Admin", icon: Settings }] : []),
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Activity className="h-6 w-6" />
            <span>MediEquip</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded hidden sm:inline">
                  {userRole === "admin" ? "Admin" : "Clinic"}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate("/auth")}
                className="ml-2"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
