import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Megaphone, 
  Search, 
  Filter,
  Calendar,
  User,
  Pin,
  MessageSquare,
  ChevronDown,
  Trash
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface Announcement {
  _id?: string;
  id?: string;
  timestamp?: string;
  role?: string;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
  author?: { name?: string } | string;
  isPinned?: boolean;
  priority?: string;
  likes?: number;
  comments?: number;
  views?: number;
}

const Announcements = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Categories", color: "default" },
    { id: "academic", label: "Academic", color: "info" },
    { id: "events", label: "Events", color: "warning" },
    { id: "facility", label: "Facility", color: "success" },
    { id: "urgent", label: "Urgent", color: "destructive" }
  ];

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const deleteAnnouncement = async (id:string)=>{
    try {
      if(!window.confirm('Delete this announcement?')) return;
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev=>prev.filter(a=>a._id!==id));
      toast({title:'Deleted'});
    } catch { toast({title:'Delete failed',variant:'destructive'}); }
  };

  // fetch announcements
  useEffect(() => {
    api
      .get("/announcements")
      .then((res) => setAnnouncements(res.data))
      .catch(() => toast({ title: "Failed to load announcements", variant: "destructive" }));
  }, []);

  // admin form state
  const [newAnn, setNewAnn] = useState<Omit<Announcement, "_id" | "imageUrl">>({ title: "", content: "", category: "academic" });
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  const handleCreate = async () => {
    try {
      const fd = new FormData();
      Object.entries(newAnn).forEach(([k,v])=>fd.append(k, v as string));
      if(imageFile) fd.append('image', imageFile);
      await api.post('/announcements', fd, { headers:{'Content-Type':'multipart/form-data'}});
      toast({title:'Announcement posted'});
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
      setNewAnn({ title:'', content:'', category:'academic' });
      setImageFile(undefined);
    } catch {
      toast({title:'Create failed', variant:'destructive'});
    }
  };
  

  /*
    {
      id: 1,
      title: "Mid-term Examination Schedule Released",
      content: "The mid-term examination schedule for all departments has been published. Students are advised to check the schedule carefully and note the exam dates. The examinations will begin from March 15th, 2024. Please ensure you have your admit cards ready.",
      author: "Dr. Sarah Johnson",
      role: "Academic Dean",
      timestamp: "2 hours ago",
      category: "academic",
      priority: "high",
      isPinned: true,
      likes: 45,
      comments: 12,
      views: 234
    },
    {
      id: 2,
      title: "Library Extended Hours During Exam Period",
      content: "The central library will be extending its operating hours during the examination period. Starting from March 10th, the library will remain open 24/7 to accommodate students' study needs. Special study zones and group discussion areas will be available.",
      author: "Ms. Emily Davis",
      role: "Chief Librarian",
      timestamp: "5 hours ago",
      category: "facility",
      priority: "medium",
      isPinned: false,
      likes: 78,
      comments: 8,
      views: 156
    },
    {
      id: 3,
      title: "Annual Campus Cultural Fest - Registration Open",
      content: "We are excited to announce that registration for our annual campus cultural fest 'SpringFest 2024' is now open! This year's theme is 'Unity in Diversity'. Various competitions including dance, music, drama, and art will be held from March 20-22, 2024.",
      author: "Student Activities Committee",
      role: "Event Coordinator",
      timestamp: "1 day ago",
      category: "events",
      priority: "low",
      isPinned: false,
      likes: 123,
      comments: 25,
      views: 445
    },
    {
      id: 4,
      title: "Hostel Wi-Fi Maintenance Scheduled",
      content: "Please be informed that routine maintenance of the hostel Wi-Fi network is scheduled for this weekend (March 9-10). There might be intermittent connectivity issues during 2 AM to 6 AM on both days. We apologize for any inconvenience.",
      author: "IT Support Team",
      role: "System Administrator",
      timestamp: "2 days ago",
      category: "facility",
      priority: "medium",
      isPinned: false,
      likes: 34,
      comments: 15,
      views: 289
    },
    {
      id: 5,
      title: "Emergency: Campus Gate Closure",
      content: "Due to ongoing construction work on the main road, the south campus gate will be temporarily closed from March 8-12. Please use the north gate for entry and exit. Shuttle service will be available from the north gate to academic buildings.",
      author: "Campus Security",
      role: "Security Head",
      timestamp: "3 days ago",
      category: "urgent",
      priority: "high",
      isPinned: true,
      likes: 67,
      comments: 23,
      views: 578
    }
  ];
  */

  const filteredAnnouncements = announcements
    .filter(announcement => 
      selectedCategory === "all" || announcement.category === selectedCategory
    )
    .filter(announcement =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive bg-destructive/10";
      case "medium": return "text-warning bg-warning/10";
      case "low": return "text-success bg-success/10";
      default: return "text-muted-foreground bg-muted/10";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic": return "info";
      case "events": return "warning";
      case "facility": return "success";
      case "urgent": return "destructive";
      default: return "default";
    }
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary rounded-2xl p-6 text-white shadow-glow mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
              <Megaphone className="h-8 w-8 mr-3" />
              Campus Announcements
            </h1>
            <p className="text-white/90">Stay updated with the latest campus news and events</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "campus" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-1"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Admin create */}
      {user?.role === "admin" && (
        <Card className="p-4 space-y-3 mb-6">
          <h3 className="font-semibold text-lg flex items-center gap-2"><Megaphone className="h-4 w-4"/> Post Announcement</h3>
          <Input placeholder="Title" value={newAnn.title} onChange={(e)=>setNewAnn({...newAnn,title:e.target.value})}/>
          <textarea className="border rounded p-2 w-full" rows={4} placeholder="Content" value={newAnn.content} onChange={(e)=>setNewAnn({...newAnn,content:e.target.value})}></textarea>
          <select className="border rounded p-2 w-full" value={newAnn.category} onChange={(e)=>setNewAnn({...newAnn,category:e.target.value})}>
            {categories.filter(c=>c.id!="all").map(c=> (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <input type="file" accept="image/*" onChange={e=> setImageFile(e.target.files?.[0])} />
          <Button onClick={handleCreate}>Publish</Button>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card 
            key={announcement.id} 
            className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card hover:shadow-elegant transition-all duration-300 relative overflow-hidden"
          >
            {announcement.isPinned && (
              <div className="absolute top-0 right-0 bg-gradient-primary text-white px-3 py-1 rounded-bl-lg">
                <Pin className="h-3 w-3 inline-block mr-1" />
                <span className="text-xs font-medium">Pinned</span>
              </div>
            )}
            {user?.role==='admin' && ((typeof announcement.author==='string' ? announcement.author===user.id : (announcement.author as any)._id===user.id)) && (              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={()=>deleteAnnouncement(announcement._id!)} title="Delete">
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge variant={getCategoryColor(announcement.category) as any}>
                  {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                </Badge>
                {/* priority badge removed */}
                  
              </div>
              <span className="text-sm text-muted-foreground">{announcement.timestamp}</span>
            </div>

          <h2 className="text-xl font-bold text-foreground mb-3 hover:text-primary transition-colors cursor-pointer">
            {announcement.title}
          </h2>

          {announcement.imageUrl && (
            <img src={`${api.defaults.baseURL?.replace('/api','')}${announcement.imageUrl}`} alt={announcement.title} className="w-full max-h-64 object-cover rounded mb-3" />
          )}
          <p className="text-muted-foreground mb-4 leading-relaxed">{announcement.content}</p>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{typeof announcement.author === 'string' ? announcement.author : announcement.author?.name}</p>
              {announcement.role && (<p className="text-xs text-muted-foreground">{announcement.role}</p>)}
            </div>
          </div>

          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="campus-outline" size="lg">
          Load More Announcements
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
    </>
  );
};

export default Announcements;