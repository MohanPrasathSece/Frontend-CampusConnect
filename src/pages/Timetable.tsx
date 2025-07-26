import Header from "@/components/Header";
import { useTimetable } from "@/hooks/useTimetable";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

interface SlotForm {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// Tailwind pastel background colors for each day
const dayColors = [
  "bg-red-50",
  "bg-orange-50",
  "bg-amber-50",
  "bg-lime-50",
  "bg-teal-50",
  "bg-sky-50",
  "bg-fuchsia-50",
];

const Timetable = () => {
  const { data } = useTimetable();
  const { user } = useAuth();
  const [slots,setSlots]=useState<SlotForm[]>(data?.slots ?? []);
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
        <Card className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2">Day</th>
                <th className="text-left p-2">Start</th>
                <th className="text-left p-2">End</th>
                <th className="text-left p-2">Subject</th>
                {user?.role==='admin' && (
                  <th className="text-left p-2">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedSlots.map((s,i)=>(
                <tr key={i} className={`border-t ${dayColors[dayIdx(s.day)%dayColors.length]}`}>
                  <td className="p-2">{s.day}</td>
                  <td className="p-2">{s.startTime}</td>
                  <td className="p-2">{s.endTime}</td>
                  <td className="p-2">{s.subject}</td>
                  <td className="p-2 space-x-1">
                    <Button variant="ghost" size="icon" onClick={()=>handleEdit(i)}><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={()=>handleDelete(i)}><Trash className="h-4 w-4 text-destructive"/></Button>
                  </td>
                </tr>
              ))}
              {(!data?.slots || data.slots.length===0) && (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No slots yet</td></tr>
              )}
            </tbody>
          </table>
        </Card>

        {true && (
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
        )}
      </div>
    </>
  );
};

export default Timetable;
