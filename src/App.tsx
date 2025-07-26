import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Announcements from "./pages/Announcements";
import LostFound from "./pages/LostFound";
import Complaints from "./pages/Complaints";
import Timetable from "./pages/Timetable";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import SkillMarket from "./pages/SkillMarket";
import Polls from "./pages/Polls";
import TechNews from "./pages/TechNews";
import Marketplace from "./pages/Marketplace";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/lostfound" element={<PrivateRoute><LostFound/></PrivateRoute>} />
          <Route path="/timetable" element={<PrivateRoute><Timetable/></PrivateRoute>} />
          <Route path="/complaints" element={<PrivateRoute><Complaints/></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} />
          <Route path="/skills" element={<PrivateRoute><SkillMarket/></PrivateRoute>} />
          <Route path="/polls" element={<PrivateRoute><Polls/></PrivateRoute>} />
          <Route path="/technews" element={<PrivateRoute><TechNews/></PrivateRoute>} />
          <Route path="/marketplace" element={<PrivateRoute><Marketplace/></PrivateRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
