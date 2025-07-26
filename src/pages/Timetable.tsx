import Header from "@/components/Header";
import { useTimetable } from "@/hooks/useTimetable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface SlotForm {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// Tailwind pastel background colors for each day
// subtle colored left borders by day for a professional look
const dayStyles = [
  "border-l-4 border-red-400/60",
  "border-l-4 border-orange-400/60",
  "border-l-4 border-amber-400/60",
  "border-l-4 border-lime-500/60",
  "border-l-4 border-teal-500/60",
  "border-l-4 border-sky-500/60",
  "border-l-4 border-fuchsia-500/60",
];

const Timetable = () => {
  const { data } = useTimetable();
  const { user } = useAuth();
  const [slots,setSlots]=useState<SlotForm[]>(data?.slots ?? []);

  // keep local slots in sync when data from server arrives
  useEffect(()=>{
    if(data?.slots) setSlots(data.slots);
  },[data]);
  const [slot, setSlot] = useState<SlotForm>({ day: "Monday", startTime: "09:00", endTime: "10:00", subject: "" });
  const [editIndex,setEditIndex]=useState<number|null>(null);
  const [submitting,setSubmitting]=useState(false);

  const saveSlots = async (newSlots: SlotForm[]) => {
    setSubmitting(true);
    try {
      await api.post("/timetable", { slots: newSlots });
      setSlots(newSlots);
      toast({ title: "Timetable updated" });
      setEditIndex(null);
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {setSubmitting(false);}  
  };

  const handleAdd = async () => {
    if(!slot.subject.trim()) {toast({title:"Enter subject"});return;}
    const newSlots = [...slots, slot];
    setSubmitting(true);
    try {
      await api.post("/timetable", { slots: newSlots });
      toast({ title: "Timetable updated" });

    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {setSubmitting(false);}  
  };

  const handleDelete=(index:number)=> saveSlots(slots.filter((_,i)=>i!==index));

  const dayIdx = (d:string)=> days.indexOf(d);
  const sortedSlots = [...slots].sort((a,b)=>{
    const di = dayIdx(a.day) - dayIdx(b.day);
    if(di!==0) return di;
    return a.startTime.localeCompare(b.startTime);
  });

  const handleEdit=(index:number)=>{
    const s=slots[index];
    setSlot(s);
    setEditIndex(index);
  };

  const handleUpdate=async()=>{
    if(editIndex===null) return;
    const updated=[...slots];
    updated[editIndex]=slot;
    await saveSlots(updated);
    setSlot({ day: "Monday", startTime: "09:00", endTime: "10:00", subject: "" });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="bg-gradient-primary rounded-2xl p-6 text-white shadow-glow mb-6 flex items-center">
          <Calendar className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">My Timetable</h1>
            <p className="text-sm opacity-90">Plan your study schedule efficiently</p>
          </div>
        </div>
        {/* Timetable grid */}
        <div className="space-y-6">
          {days.map((d,di)=>{
            const daySlots = sortedSlots.filter(s=>s.day===d);
            if(daySlots.length===0) return null;
            return (
              <Card key={d} className={`${di%2===0?'bg-sky-50':'bg-white'} p-4 shadow-sm`}>
                <h2 className="text-lg font-semibold mb-2 text-sky-700 flex items-center"><Calendar className="h-4 w-4 mr-1" />{d}</h2>
                <ul className="space-y-2">
                  {daySlots.map((s,i)=>(
                    <li key={i} className="flex items-center justify-between border-l-4 pl-3 py-1 border-sky-400/70 bg-white rounded-md shadow-sm">
                      <div>
                        <p className="font-medium text-sm">{s.subject}</p>
                        <p className="text-xs text-muted-foreground">{s.startTime} - {s.endTime}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={()=>handleEdit(slots.indexOf(s))}><Pencil className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" onClick={()=>handleDelete(sortedSlots.indexOf(s))}><Trash className="h-4 w-4 text-destructive"/></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
          {sortedSlots.length===0 && (
            <Card className="p-6 text-center text-muted-foreground">No slots yet</Card>
          )}
        </div>

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Add Slot</h3>
          <select aria-label="Day" className="border rounded p-2 w-full" value={slot.day} onChange={e=>setSlot({...slot,day:e.target.value})}>
            {days.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex gap-3">
            <Input type="time" value={slot.startTime} onChange={e=>setSlot({...slot,startTime:e.target.value})}/>
            <Input type="time" value={slot.endTime} onChange={e=>setSlot({...slot,endTime:e.target.value})}/>
          </div>
          <Input placeholder="Subject" value={slot.subject} onChange={e=>setSlot({...slot,subject:e.target.value})}/>
          {editIndex===null ? (
            <Button onClick={handleAdd} disabled={submitting}>{submitting?"Saving...":"Add"}</Button>
          ) : (
            <Button onClick={handleUpdate} disabled={submitting}>{submitting?"Saving...":"Update"}</Button>
          )}
        </Card>
      </div>
    </>
  );
};

export default Timetable;
