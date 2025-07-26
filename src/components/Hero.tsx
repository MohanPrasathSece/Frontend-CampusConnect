import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Megaphone, 
  Search, 
  Calendar, 
  FileText,
  ArrowRight,
  Users,
  Clock,
  Star
} from "lucide-react";

const Hero = () => {
  const features = [
    {
      icon: Megaphone,
      title: "Campus Announcements",
      description: "Stay updated with the latest campus news and events",
      color: "text-info"
    },
    {
      icon: Search,
      title: "Lost & Found",
      description: "Find or report lost items with smart search filters",
      color: "text-warning"
    },
    {
      icon: Calendar,
      title: "Timetable Manager",
      description: "Organize your class schedule with ease",
      color: "text-success"
    },
    {
      icon: FileText,
      title: "Hostel Complaints",
      description: "Report and track maintenance issues efficiently",
      color: "text-destructive"
    }
  ];

  const stats = [
    { label: "Active Students", value: "2,500+", icon: Users },
    { label: "Announcements Today", value: "12", icon: Megaphone },
    { label: "Issues Resolved", value: "98%", icon: Star },
    { label: "Avg Response Time", value: "2hrs", icon: Clock }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-secondary"></div>
      
      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Welcome to{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                CampusLink
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your centralized hub for campus utilities. Stay connected, organized, and informed 
              with everything you need for campus life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button variant="campus" size="lg" className="animate-bounce-in">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/announcements">
                <Button variant="outline" size="lg" className="animate-bounce-in delay-75">
                  View Announcements
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-fade-in delay-150">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 text-center bg-card/80 backdrop-blur-sm border-border/50 shadow-card">
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-lg mb-4 group-hover:animate-glow">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-fade-in delay-300">
          <Card className="p-8 bg-gradient-primary border-0 shadow-glow">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to streamline your campus experience?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of students who are already using CampusLink to stay organized and connected.
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Join CampusLink Today
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Hero;