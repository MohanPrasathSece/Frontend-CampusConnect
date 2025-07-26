import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const fetchItems = async () => {
  const res = await api.get('/marketplace');
  return res.data;
};

type Item = {
  _id: string;
  title: string;
  description: string;
  price: number;
  expiresAt: string;
  contact: string;
  category: string;
  seller: string;
};

const Marketplace = () => {
  const { user } = useAuth();
  const { data: items = [] } = useQuery<Item[]>({ queryKey: ['marketplace'], queryFn: fetchItems });
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'books', contact: '', days: 7 });

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Student Marketplace</h1>
          {user && (
            <Button onClick={() => setShowAdd(true)}>List Item</Button>
          )}
        </div>
        <div className="space-y-4">
          {items.map(item => (
            <Card key={item._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 space-y-1">
                <h2 className="font-semibold text-lg">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-sm">Type: {item.category}</p>
                <p className="text-sm">Expires: {new Date(item.expiresAt).toLocaleDateString()}</p>
                <div className="flex gap-2 mt-1">
                  <a href={`tel:${item.contact}`} className="text-blue-600 underline">Call</a>
                  {user && (user.id===item.seller || user.role==='admin') && (
                    <Button variant="destructive" size="sm" onClick={async()=>{
                      if(!window.confirm('Delete this listing?')) return;
                      await api.delete(`/marketplace/${item._id}`);
                      qc.invalidateQueries({queryKey:['marketplace']});
                    }}>Delete</Button>
                  )}
                </div>
              </div>
              <div className="mt-2 md:mt-0 text-primary font-bold min-w-[80px] text-right">
                {item.price === 0 ? 'Free / Donate' : `₹${item.price}`}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add item dialog */}
      {user && (
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="space-y-3">
            <DialogHeader>List an Item</DialogHeader>
            <Input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <textarea className="border rounded p-2 w-full" rows={3} placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            <Input type="number" placeholder="Price (₹) — 0 for free" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
            <select aria-label="Type" className="border rounded p-2 w-full" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              <option value="books">Books</option>
              <option value="equipment">Equipment</option>
              <option value="electronics">Electronics</option>
              <option value="other">Other</option>
            </select>
            <Input placeholder="Contact info" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/>
            <Input type="number" placeholder="Expires (days)" value={form.days} onChange={e=>setForm({...form,days:Number(e.target.value)})}/>
            <DialogFooter>
              <Button onClick={async()=>{
                await api.post('/marketplace',{...form,price:Number(form.price||0)});
                qc.invalidateQueries({queryKey:['marketplace']});
                setShowAdd(false);
                setForm({ title: '', description: '', price: 0, category: 'books', contact: '', days: 7 });
              }}>Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Marketplace;
