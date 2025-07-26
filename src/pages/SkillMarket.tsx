import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { useBookings } from "@/hooks/useBookings";
import { useAcceptedBookings } from "@/hooks/useAcceptedBookings";
import { useMyBookings } from "@/hooks/useMyBookings";
import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SkillOffer {
  _id: string;
  skill: string;
  description?: string;
  availableSlots: { day: string; start: string; end: string }[];
  requiredSkill?: string;
  tutor: { _id: string; name: string };
  createdAt: string;
}

const SkillMarket = () => {
  // state

  const { user } = useAuth();
  const { data: myAccepted = [] } = useAcceptedBookings();
  const { data: myBookings = [] } = useMyBookings();
  const [requestedIds, setRequestedIds] = useState<string[]>(myBookings.map(b=>b.offer._id));
  // keep requestedIds in sync when bookings refetch
  useEffect(()=>{
    setRequestedIds(myBookings.map(b=>b.offer._id));
  },[myBookings]);
  const queryClient = useQueryClient();
  const [requestsOffer, setRequestsOffer] = useState<SkillOffer | null>(null);
  const { data: bookings = [], refetch: refetchBookings } = useBookings(requestsOffer?._id ?? null);
  useEffect(()=>{if(requestsOffer){refetchBookings();}},[requestsOffer,refetchBookings]);
  const { data: offers = [] } = useQuery<SkillOffer[]>({
    queryKey: ['skills'],
    queryFn: async () => (await api.get('/skills')).data,
  });

  // offer form state
  const [offerForm, setOfferForm] = useState({ skill: '', description: '', requiredSkill: '' });
  const [tempSlot, setTempSlot] = useState({ day: 'Mon', start: '09:00', end: '10:00' });
  const [slots, setSlots] = useState<{day:string;start:string;end:string}[]>([]);
  const [showOffer, setShowOffer] = useState(false);

  // booking state
  const [selectedOffer, setSelectedOffer] = useState<SkillOffer | null>(null);
  const [slot, setSlot] = useState('');
  const [phone,setPhone] = useState('');

  const createOffer = async () => {
    const payload = {
      skill: offerForm.skill,
      description: offerForm.description,
      requiredSkill: offerForm.requiredSkill,
      availableSlots: slots,
    };
    await api.post('/skills', payload);
    toast('Offer posted');
    queryClient.invalidateQueries({ queryKey: ['skills'] });
    setShowOffer(false);
    setOfferForm({ skill: '', description: '', requiredSkill: '' });
    setSlots([]);
  };

  const deleteOffer = async (id: string) => {
    await api.delete(`/skills/${id}`);
    toast('Offer deleted');
    queryClient.invalidateQueries({ queryKey: ['skills'] });
  };

  const requestBooking = async () => {
    if (!selectedOffer) return;
    if(!phone){toast('Enter your phone number',{description:'Phone required'}); return;}
    const chosen = selectedOffer.availableSlots[parseInt(slot,10)];
    await api.post(`/skills/${selectedOffer._id}/book`, { slot: chosen, phone });
    toast('Booking requested');
    setRequestedIds([...requestedIds, selectedOffer._id]);
    setSelectedOffer(null);
    setPhone('');
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/skills/${id}`);
    toast('Offer deleted');
    queryClient.invalidateQueries({ queryKey: ['skills'] });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="bg-blue-600 px-4 py-3 rounded-xl shadow flex flex-col items-center text-white mb-4">
            <span className="text-xl md:text-2xl font-bold leading-tight">Skill Exchange Marketplace</span>
          </div>
          <Button onClick={() => setShowOffer(true)}>Offer a Skill</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {offers.map((o) => (
            <Card key={o._id} className="p-4 space-y-2">
              <h2 className="text-lg font-semibold">{o.skill}</h2>
              <p className="text-sm text-muted-foreground">{o.description}</p>
              
              {o.requiredSkill && <p className="text-xs text-primary">Wants to learn: {o.requiredSkill}</p>}
              <p className="text-xs">Tutor: {o.tutor.name}</p>
              <ul className="text-xs list-disc pl-4">
                {o.availableSlots.map((s,i) => (
                  <li key={i}>{`${s.day} ${s.start} - ${s.end}`}</li>
                ))}
              </ul>
              <p className="text-xs mt-1">Posted {dayjs(o.createdAt).fromNow()}</p>
              {/* show scheduled time for accepted booking */}
              {(() => {
                const ab = myAccepted.find(b => b.offer._id === o._id);
                if (ab) {
                  return (
                    <p className="text-xs font-medium text-primary">
                      Scheduled: {`${ab.slot.day} ${ab.slot.start} - ${ab.slot.end}`}
                    </p>
                  );
                }
                return null;
              })()}
              {user?.id === o.tutor._id ? (
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={async () => handleDelete(o._id)}>
                    Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={()=> setRequestsOffer(o)}>
                    View Requests
                  </Button>
                </div>
              ) : (
                <Button
                  variant="campus"
                  size="sm"
                  disabled={requestedIds.includes(o._id) || myAccepted.some(b=>b.offer._id===o._id)}
                  onClick={() => !requestedIds.includes(o._id) && setSelectedOffer(o)}
                >
                  {myAccepted.some(b=>b.offer._id===o._id) ? 'Accepted' : requestedIds.includes(o._id) ? 'Requested' : 'Request Session'}
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Offer dialog */}
      {showOffer && (
        <Dialog open={showOffer} onOpenChange={setShowOffer}>
          <DialogContent className="space-y-3">
            <DialogHeader>Offer a Skill</DialogHeader>
            <input
              className="border rounded p-2 w-full"
              placeholder="Skill (e.g., Python)"
              value={offerForm.skill}
              onChange={(e) => setOfferForm({ ...offerForm, skill: e.target.value })}
            />
            <textarea
              className="border rounded p-2 w-full"
              placeholder="Description (optional)"
              rows={3}
              value={offerForm.description}
              onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
            />
            <div className="space-y-2 border rounded p-3">
              <span className="font-medium text-sm">Add Slot</span>
              <div className="grid grid-cols-3 gap-2 items-center">
                <select aria-label="Day" className="border rounded p-2" value={tempSlot.day} onChange={e=>setTempSlot({...tempSlot,day:e.target.value})}>
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=> <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="time" className="border rounded p-2" value={tempSlot.start} onChange={e=>setTempSlot({...tempSlot,start:e.target.value})}/>
                <input type="time" className="border rounded p-2" value={tempSlot.end} onChange={e=>setTempSlot({...tempSlot,end:e.target.value})}/>
              </div>
              <Button variant="campus" size="sm" onClick={()=>{ setSlots([...slots,tempSlot]);}}>
                Add
              </Button>
              {slots.length>0 && (
                <ul className="mt-2 space-y-1">
                  {slots.map((s,i)=>(
                    <li key={i} className="flex items-center justify-between bg-muted p-1 rounded text-xs">
                      <span>{`${s.day} ${s.start}-${s.end}`}</span>
                      <X className="h-3 w-3 cursor-pointer" onClick={()=>setSlots(slots.filter((_,idx)=>idx!==i))}/>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <textarea
              className="border rounded p-2 w-full"
              placeholder="Required skill (optional)"
              rows={1}
              value={offerForm.requiredSkill}
              onChange={(e) => setOfferForm({ ...offerForm, requiredSkill: e.target.value })}
            />
            <DialogFooter>
              <Button onClick={createOffer}>Publish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Booking dialog */}
      {selectedOffer && (
        <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
          <DialogContent className="space-y-3">
            <DialogHeader>Book a Session - {`${selectedOffer.skill}`}</DialogHeader>
            {requestsOffer?.requiredSkill && <p className="text-xs">Exchange skill offered: {requestsOffer.requiredSkill}</p>}
            <select aria-label="Select slot" className="border rounded p-2 w-full" value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option value="">Select slot</option>
              {selectedOffer.availableSlots.map((s,index) => (
                <option key={index} value={index.toString()}>
                  {`${s.day} ${s.start}-${s.end}`}
                </option>
              ))}
            </select>
            <input
              className="border rounded p-2 w-full"
              placeholder="Your phone number"
              value={phone}
              onChange={e=>setPhone(e.target.value)}
            />
            <DialogFooter>
              <Button disabled={!slot} onClick={requestBooking}>
                Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Requests dialog */}
      {requestsOffer && (
        <Dialog open onOpenChange={(open)=>{if(!open) setRequestsOffer(null)}}>
          <DialogContent className="space-y-4">
            <DialogHeader>Requests for {requestsOffer.skill}</DialogHeader>
            {bookings.length===0 && <p className="text-sm">No requests yet.</p>}
            {bookings.map(b=> (
              <Card key={b._id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.student?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{`${b.slot.day} ${b.slot.start}-${b.slot.end}`}</p>
                  {b.phone && <p className="text-xs">Phone: {b.phone}</p>}
                  {requestsOffer.requiredSkill && <p className="text-xs">Exchange skill offered: {requestsOffer.requiredSkill}</p>}
                </div>
                {b.status==='pending'? (
                  <Button size="sm" onClick={async ()=>{await api.patch(`/skills/bookings/${b._id}`,{status:'accepted'}); toast('Accepted'); refetchBookings(); queryClient.invalidateQueries({queryKey:['skills']});}}>
                    Accept
                  </Button>
                ) : <Badge variant="secondary">Accepted</Badge>}
              </Card>
            ))}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};


export default SkillMarket;
