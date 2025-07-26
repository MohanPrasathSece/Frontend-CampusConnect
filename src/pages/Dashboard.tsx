import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { 
  Megaphone, 
  Search, 
  Calendar, 
  FileText,
  Plus,
  Clock,
  MapPin,
  User,
  TrendingUp,
  Bell,
  Newspaper
} from "lucide-react";

import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/contexts/AuthContext";
import { useLostFound } from "@/hooks/useLostFound";
import { useTimetable } from "@/hooks/useTimetable";
import { useComplaints } from "@/hooks/useComplaints";
import { useTechNews } from "@/hooks/useTechNews";
import dayjs from "dayjs";
import { useState } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Dashboard = () => {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'academic', image: undefined as File | undefined });
  const [showComplaint,setShowComplaint]=useState(false);
  const [complaint,setComplaint]=useState({category:'general',description:''});
  const categories = [
    {id:'academic',label:'Academic'},
    {id:'events',label:'Events'},
    {id:'facility',label:'Facility'},
    {id:'urgent',label:'Urgent'}
  ];
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: announcements = [] } = useAnnouncements();
  const { data: techNews = [] } = useTechNews();
  const { data: items = [] } = useLostFound();
  const { data: timetable } = useTimetable();
  const { data: complaints = [] } = useComplaints();

  const today = dayjs().format('dddd');
  const todaySlots = (timetable?.slots ?? []).filter((s:any)=>s.day===today);

  const quickStats = [
    { label: "New Announcements", value: announcements.length.toString(), icon: Megaphone, route: "/announcements" },
    { label: "Lost Items", value: items.length.toString(), icon: Search, route: "/lostfound" },
    { label: "Today's Classes", value: todaySlots.length.toString(), icon: Calendar, route: "/timetable" },
    { label: "Open Complaints", value: complaints.filter((c:any)=>c.status!=="Resolved").length.toString(), icon: FileText, route: "/complaints" },
    { label: "Tech Opportunities", value: techNews.length.toString(), icon: Newspaper, route: "/technews" }
  ];

  const recentAnnouncements = announcements.slice(0,3).map((a:any)=>({
    id: a._id,
    title: a.title,
    content: a.content,
    time: dayjs(a.createdAt).fromNow(),
    priority: 'medium',
    category: a.category
  }));

  
  

  const upcomingClasses = todaySlots.slice(0,3).map((s:any)=>({
    subject: s.subject,
    time: `${s.startTime} - ${s.endTime}`,
    room: s.location || '',
    professor: ''
  }));

  const recentActivity = [
    ...items.slice(0,3).map((i:any)=>({ action: 'Lost item reported', item: i.description, time: dayjs(i.createdAt).fromNow(), type: 'lost' })),
    ...complaints.slice(0,3).map((c:any)=>({ action: `Complaint ${c.status}`, item: c.category, time: dayjs(c.updatedAt || c.createdAt).fromNow(), type: 'complaint' }))
  ];



  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-2xl p-6 text-white shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
            <p className="text-white/90">Here's what's happening on campus today</p>
          </div>

        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card
            key={index}
            className="p-4 bg-card/80 backdrop-blur-sm border-border/50 shadow-card hover:shadow-elegant transition-all duration-300 group cursor-pointer"
            onClick={() => quickStats[index].route && navigate(quickStats[index].route)}>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg group-hover:animate-glow">
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Announcements */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <Megaphone className="h-5 w-5 mr-2 text-primary" />
                Recent Announcements
              </h2>
              <Button variant="campus-outline" size="sm" onClick={() => navigate('/announcements')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="p-4 bg-secondary/30 rounded-xl border border-border/30 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate('/announcements')}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={announcement.priority === 'high' ? 'destructive' : announcement.priority === 'medium' ? 'default' : 'secondary'}>
                        {announcement.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{announcement.time}</span>
                    </div>
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div>
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Today's Classes
              </h2>
              {user?.role === 'admin' && (
                <Button variant="ghost" size="icon" onClick={() => setShowAdd(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {upcomingClasses.map((cls, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground text-sm">{cls.subject}</h3>
                    <Badge variant="outline" className="text-xs">
                      {cls.time}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground space-x-3">
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {cls.room}
                    </span>
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {cls.professor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={`p-1.5 rounded-full ${
                    activity.type === 'found' ? 'bg-success/20 text-success' :
                    activity.type === 'resolved' ? 'bg-info/20 text-info' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {activity.type === 'found' ? <Search className="h-3 w-3" /> :
                     activity.type === 'resolved' ? <FileText className="h-3 w-3" /> :
                     <Bell className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.item}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {user?.role === 'admin' && (
            <Button variant="campus-outline" className="h-20 flex-col space-y-2" onClick={() => setShowAdd(true)}>
              <Megaphone className="h-6 w-6" />
              <span className="text-sm">Post Announcement</span>
            </Button>
          )}
          <Button variant="campus-outline" className="h-20 flex-col space-y-2" onClick={()=>setShowComplaint(true)}>
            <FileText className="h-6 w-6" />
            <span className="text-sm">File Complaint</span>
          </Button>
          <Button variant="campus-outline" className="h-20 flex-col space-y-2" onClick={() => navigate('/skills')}>
            <User className="h-6 w-6" />
            <span className="text-sm">Offer Skill</span>
          </Button>
          <Button variant="campus-outline" className="h-20 flex-col space-y-2" onClick={() => navigate('/lostfound')}>
            <Search className="h-6 w-6" />
            <span className="text-sm">Report Lost Item</span>
          </Button>
          <Button variant="campus-outline" className="h-20 flex-col space-y-2" onClick={() => navigate('/timetable')}>
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Add Class</span>
          </Button>
        </div>
      </Card>

      {/* Post Announcement Modal (admin only) */}
      {user?.role === 'admin' && (
       <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="space-y-3">
          <DialogHeader>Post Announcement</DialogHeader>
          <input aria-label="Title" className="border rounded p-2 w-full" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <textarea aria-label="Content" className="border rounded p-2 w-full" rows={4} placeholder="Content" value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/>
          <select aria-label="Category" className="border rounded p-2 w-full" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input type="file" accept="image/*" onChange={e=>setForm({...form,image:e.target.files?.[0]})}/>
          <DialogFooter>
            <Button onClick={async()=>{
              const fd=new FormData();
              fd.append('title',form.title);
              fd.append('content',form.content);
              fd.append('category',form.category);
              if(form.image) fd.append('image',form.image);
              await api.post('/announcements',fd,{headers:{'Content-Type':'multipart/form-data'}});
              queryClient.invalidateQueries({ queryKey: ['announcements'] });
              setShowAdd(false);
            }}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
)}

      {/* File Complaint Modal */}
      {showComplaint && (
        <Dialog open={showComplaint} onOpenChange={setShowComplaint}>
          <DialogContent className="space-y-3">
            <DialogHeader>File Complaint</DialogHeader>
            <select aria-label="Category" className="border rounded p-2 w-full" value={complaint.category} onChange={e=>setComplaint({...complaint,category:e.target.value})}>
              <option value="general">General</option>
              <option value="facility">Facility</option>
              <option value="academic">Academic</option>
            </select>
            <textarea aria-label="Description" className="border rounded p-2 w-full" rows={4} placeholder="Describe issue" value={complaint.description} onChange={e=>setComplaint({...complaint,description:e.target.value})}/>
            <DialogFooter>
              <Button onClick={async()=>{
                await api.post('/complaints',complaint);
                queryClient.invalidateQueries({queryKey:['complaints']});
                setShowComplaint(false);
                setComplaint({category:'general',description:''});
              }}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </>
  );
};

export default Dashboard;