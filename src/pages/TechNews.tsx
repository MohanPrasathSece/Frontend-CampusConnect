import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTechNews } from "@/hooks/useTechNews";
import api from "@/services/api";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Newspaper } from "lucide-react";

const TechNews = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (id:string)=>{ await api.delete(`/technews/${id}`); },
    onSuccess: ()=> qc.invalidateQueries({queryKey:["technews"]})
  });
  const [form, setForm] = useState({ title:'', description:'', link:'', type:'news', image: undefined as File | undefined });
  const { data: news = [], isLoading } = useTechNews();

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <Newspaper className="h-6 w-6 mr-2 text-primary" /> Tech News & Opportunities
        </h1>
        {/* Post form */}
        <Card className="p-6 mb-6 space-y-4">
          <h2 className="font-medium">Share opportunity / news</h2>
          <Input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <textarea className="border rounded p-2 w-full" rows={3} placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          <Input placeholder="Link (optional)" value={form.link} onChange={e=>setForm({...form,link:e.target.value})}/>
          <select className="border rounded p-2 w-full" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
            <option value="news">News</option>
            <option value="hackathon">Hackathon</option>
            <option value="internship">Internship</option>
            <option value="other">Other</option>
          </select>
          <input type="file" accept="image/*" onChange={e=> setForm({...form,image:e.target.files?.[0]})}/>
          <Button onClick={async()=>{
            try {
              const fd=new FormData();
              Object.entries(form).forEach(([k,v])=>{
                if(k==='image') return;
                fd.append(k,v as string);
              });
              if(form.image) fd.append('image',form.image);
              await api.post('/technews',fd,{headers:{'Content-Type':'multipart/form-data'}});
              toast({title:'Posted'});
            }catch{toast({title:'Post failed',variant:'destructive'});}
          }}>Post</Button>
        </Card>

        {news.map((item) => (
          <Card key={item._id} className="p-6 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{item.title}</span>
              {item.link && (
                <Button variant="link" size="sm" asChild>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{item.description}</p>
            {item.imageUrl && <img src={`${api.defaults.baseURL?.replace('/api','')}${item.imageUrl}`} alt="news" className="w-full max-h-64 object-cover rounded"/>}
            {(user?.id===item.author || user?.role==='admin') && (
              <Button variant="destructive" size="sm" onClick={()=>deleteMutation.mutate(item._id)}>Delete</Button>
            )}
            <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
          </Card>
        ))}
      </div>
    </>
  );
};

export default TechNews;
