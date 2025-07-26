import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  User, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dark,setDark]=useState<boolean>(()=>{
    if(typeof window==='undefined') return false;
    return localStorage.theme==='dark' || (!('theme'in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  useEffect(()=>{
    if(dark){
      document.documentElement.classList.add('dark');
      localStorage.theme='dark';
    }else{
      document.documentElement.classList.remove('dark');
      localStorage.theme='light';
    }
  },[dark]);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-glow animate-glow">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CampusLink</h1>
              <p className="text-xs text-muted-foreground">Student Utility Hub</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard">
              <Button 
                variant="ghost" 
                className={`text-muted-foreground hover:text-foreground ${
                  location.pathname === '/dashboard' ? 'text-primary bg-primary/10' : ''
                }`}
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/announcements">
              <Button 
                variant="ghost" 
                className={`text-muted-foreground hover:text-foreground ${
                  location.pathname === '/announcements' ? 'text-primary bg-primary/10' : ''
                }`}
              >
                Announcements
              </Button>
            </Link>
            <Link to="/lostfound">
              <Button variant="ghost" className={`text-muted-foreground hover:text-foreground ${location.pathname === '/lostfound' ? 'text-primary bg-primary/10' : ''}`}>
                Lost & Found
              </Button>
            </Link>
            <Link to="/timetable">
              <Button variant="ghost" className={`text-muted-foreground hover:text-foreground ${location.pathname === '/timetable' ? 'text-primary bg-primary/10' : ''}`}>
                Timetable
              </Button>
            </Link>
            <Link to="/skills">
              <Button variant="ghost" className={`text-muted-foreground hover:text-foreground ${location.pathname === '/skills' ? 'text-primary bg-primary/10' : ''}`}>
                Skill Market
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="ghost" className={`text-muted-foreground hover:text-foreground ${location.pathname === '/marketplace' ? 'text-primary bg-primary/10' : ''}`}>
                Marketplace
              </Button>
            </Link>
            <Link to="/polls">
              <Button variant="ghost" className={`text-muted-foreground hover:text-foreground ${location.pathname === '/polls' ? 'text-primary bg-primary/10' : ''}`}>
                Polls
              </Button>
            </Link>
            <Link to="/technews">
              <Button variant="ghost" className={`text-muted-foreground hover:text-foreground ${location.pathname === '/technews' ? 'text-primary bg-primary/10' : ''}`}>
                Tech Feed
              </Button>
            </Link>
            <Link to="/complaints">
              <Button variant="ghost" className={`text-muted-foreground hover:text-foreground ${location.pathname === '/complaints' ? 'text-primary bg-primary/10' : ''}`}>
                Complaints
              </Button>
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">

            {/* User Profile */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" title="Account options">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={()=>{logout();navigate('/login');}} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button variant="campus" size="sm">
                Login
              </Button>
            )}

            {/* Dark mode toggle */}
            <Button variant="ghost" size="icon" onClick={()=>setDark(!dark)} className="mr-2">
              {dark ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
            </Button>
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col space-y-2 pt-4">
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start text-muted-foreground hover:text-foreground ${
                    location.pathname === '/dashboard' ? 'text-primary bg-primary/10' : ''
                  }`}
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/announcements">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start text-muted-foreground hover:text-foreground ${
                    location.pathname === '/announcements' ? 'text-primary bg-primary/10' : ''
                  }`}
                >
                  Announcements
                </Button>
              </Link>
              <Link to="/lostfound">
                <Button variant="ghost" className={`w-full justify-start text-muted-foreground hover:text-foreground ${location.pathname === '/lostfound' ? 'text-primary bg-primary/10' : ''}`}> 
                  Lost & Found
                </Button>
              </Link>
              <Link to="/timetable">
                <Button variant="ghost" className={`w-full justify-start text-muted-foreground hover:text-foreground ${location.pathname === '/timetable' ? 'text-primary bg-primary/10' : ''}`}> 
                  Timetable
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="ghost" className={`w-full justify-start text-muted-foreground hover:text-foreground ${location.pathname === '/marketplace' ? 'text-primary bg-primary/10' : ''}`}>
                  Marketplace
                </Button>
              </Link>
              <Link to="/skills">
                <Button variant="ghost" className={`w-full justify-start text-muted-foreground hover:text-foreground ${location.pathname === '/skills' ? 'text-primary bg-primary/10' : ''}`}>
                  Skill Market
                </Button>
              </Link>
              <Link to="/polls">
                <Button variant="ghost" className={`w-full justify-start text-muted-foreground hover:text-foreground ${location.pathname === '/polls' ? 'text-primary bg-primary/10' : ''}`}> 
                  Polls
                </Button>
              </Link>
              <Link to="/technews">
                <Button variant="ghost" className={`w-full justify-start text-muted-foreground hover:text-foreground ${location.pathname === '/technews' ? 'text-primary bg-primary/10' : ''}`}> 
                  Tech Feed
                </Button>
              </Link>
              <Link to="/complaints">
                <Button variant="ghost" className={`w-full justify-start text-muted-foreground hover:text-foreground ${location.pathname === '/complaints' ? 'text-primary bg-primary/10' : ''}`}> 
                  Complaints
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;