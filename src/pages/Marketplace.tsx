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

type Interest = { _id:string; user: string; phone: string; accepted?: boolean; name?:string };

type Item = {
  _id: string;
  title: string;
  description: string;
  price: number;
  expiresAt: string;
  contact: string;
  category: string;
  seller: string;
  sellerEmail?: string;
  image?: string;
  interests?: Interest[];
};

const Marketplace = () => {
  const { user } = useAuth();
  const { data: items = [] } = useQuery<Item[]>({ queryKey: ['marketplace'], queryFn: fetchItems });
  const qc = useQueryClient();
  const [deletingId,setDeletingId]=useState<string|null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image:'', price: '', category: 'books', contact: '', days: 7 });
  const [file, setFile] = useState<File | null>(null);
  const [interestLoadingId,setInterestLoadingId]=useState<string|null>(null);
  const [showInterestsId,setShowInterestsId]=useState<string|null>(null);
  const [interests,setInterests]=useState<Interest[]>([]);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white bg-blue-600 px-4 py-2 rounded-lg shadow">Student Marketplace</h1>
          {user && (
            <Button onClick={() => setShowAdd(true)}>List Item</Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">BUY AND SELL ITEMS here.</p>
        <div className="space-y-4">
          {items.map(item => {
            const acceptedInt = item.interests?.find(i => i.accepted);
            const isSold = !!acceptedInt;
            const sellerName = item.sellerEmail ? item.sellerEmail.split('@')[0] : 'User';
            const isMe = user && user.id === item.seller;
            return (
              <Card key={item._id} className={`p-4 flex flex-col md:flex-row md:items-center md:justify-between ${isSold ? 'opacity-90' : ''}`}>
                {item.image && <img src={item.image} alt={item.title} className="w-full md:w-32 h-32 object-cover rounded mb-2" />}
                <div className="flex-1 space-y-1">
                  <h2 className="font-semibold text-lg">{item.title}</h2>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm">Seller: {sellerName}</p>
                  <p className="text-sm">Type: {item.category}</p>
                  <p className="text-sm">Expires: {new Date(item.expiresAt).toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-1">
                    {/* Interested / View Interests */}
                    {!isSold && user && user.id!==item.seller && (
                      item.interests?.some(i=>i.user===user.id) ? (
                        <span className="text-green-600 font-medium">Requested</span>
                      ) : (
                        <Button size="sm" variant="outline" disabled={interestLoadingId===item._id} onClick={async()=>{
                          const phone=prompt('Your phone number');
                          if(!phone) return;
                          try{
                            setInterestLoadingId(item._id);
                            await api.post(`/marketplace/${item._id}/interested`,{phone});
                            qc.invalidateQueries({queryKey:['marketplace']});
                          }finally{
                            setInterestLoadingId(null);
                          }
                        }}>{interestLoadingId===item._id?'Sending...':'Interested'}</Button>
                      )
                    )}
                    {user && (user.id===item.seller || user.role==='admin') && (
                      <Button size="sm" variant="secondary" onClick={async()=>{
                        const res=await api.get(`/marketplace/${item._id}/interests`);
                        setInterests(res.data as Interest[]);
                        setShowInterestsId(item._id);
                      }}>View Interests</Button>
                    )}

                    {isSold && !(user && (user.id===item.seller || user.id===acceptedInt?.user)) && (
                      <span className="text-sm text-muted-foreground">Sold</span>
                    )
                    }

                    
                  {user && user.id!==item.seller && !isSold && item.interests?.some(i=>i.user===user.id) && (
                     <a href={`tel:${item.contact}`} className="text-blue-600 underline">Call</a>
                   )}
                  {user && (user.id===item.seller || user.role==='admin') && (
                    <Button variant="destructive" size="sm" disabled={deletingId===item._id} onClick={async()=>{
                      if(!window.confirm('Delete this listing?')) return;
                      try{
                        setDeletingId(item._id);
                        await api.delete(`/marketplace/${item._id}`);
                        qc.invalidateQueries({queryKey:['marketplace']});
                      }finally{
                        setDeletingId(null);
                      }
                    }}>{deletingId===item._id? 'Deleting...':'Delete'}</Button>
                  )}
                </div>
              </div>
              <div className="mt-2 md:mt-0 text-primary font-bold min-w-[80px] text-right">
                {isSold ? (
                  user && user.id===item.seller ? (
                    <span className="text-green-600">Closed</span>
                  ) : (
                    <span className="text-red-500">Sold</span>
                  )
                ) : (
                  <span>{item.price === 0 ? 'Free' : `₹${item.price}`}</span>
                )}
              </div>
            </Card>
           );
          })}
        </div>
      </div>

      {/* Add item dialog */}
      {user && (
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="space-y-3">
            <DialogHeader>List an Item</DialogHeader>
            <Input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <textarea className="border rounded p-2 w-full" rows={3} placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            <div className="space-y-1 w-full">
              <label className="text-sm font-medium">Quantity</label>
              <Input type="number" placeholder="1" value={form.days} onChange={e=>setForm({...form,days:Number(e.target.value)})}/>
            </div>
            <Input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
            <div className="space-y-1 w-full">
              <label className="text-sm font-medium">Price (₹)</label>
              <Input type="number" placeholder="0 for free" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
            </div>
            <select aria-label="Type" className="border rounded p-2 w-full" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              <option value="books">Books</option>
              <option value="equipment">Equipment</option>
              <option value="electronics">Electronics</option>
              <option value="other">Other</option>
            </select>
            <Input placeholder="Contact info" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/>
            <div className="space-y-1 w-full">
              <label className="text-sm font-medium">Quantity</label>
              <Input type="number" placeholder="1" value={form.days} onChange={e=>setForm({...form,days:Number(e.target.value)})}/>
            </div>
            <DialogFooter>
              <Button onClick={async()=>{
                const payload = {...form,price:Number(form.price||0)};
                if(file){
                  const fd = new FormData();
                  Object.entries(payload).forEach(([k,v])=>fd.append(k,String(v)));
                  fd.append('image',file);
                  await api.post('/marketplace',fd,{headers:{'Content-Type':'multipart/form-data'}});
                }else{
                  await api.post('/marketplace',payload);
                }
                qc.invalidateQueries({queryKey:['marketplace']});
                setShowAdd(false);
                setForm({ title: '', description: '', image:'', price: '', category: 'books', contact: '', days: 7 });
              }}>Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Interests Dialog */}
      <Dialog open={!!showInterestsId} onOpenChange={(v)=>{if(!v) setShowInterestsId(null);}}>
        <DialogContent className="max-w-sm">
          <DialogHeader>Interested Users</DialogHeader>
          {interests.length===0 ? (
            <p className="text-sm">No interests yet.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {interests.map(int=> (
                <div key={int._id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <p className="font-medium">{typeof int.user === 'object' && (int.user as any)?.name ? (int.user as any).name : int.name ?? 'User'}</p>
                    <p className="text-sm text-muted-foreground">{int.phone}</p>
                  </div>
                  {int.accepted ? (
                    <span className="text-green-600 text-sm">Sold</span>
                  ) : (
                    <Button size="sm" disabled={interestLoadingId===int._id} onClick={async()=>{
                      try{
                        setInterestLoadingId(int._id);
                        await api.post(`/marketplace/${showInterestsId}/interests/${int._id}/accept`);
                        const res=await api.get(`/marketplace/${showInterestsId}/interests`);
                        setInterests(res.data as Interest[]);
                      }finally{
                        setInterestLoadingId(null);
                      }
                    }}>Accept</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Marketplace;
