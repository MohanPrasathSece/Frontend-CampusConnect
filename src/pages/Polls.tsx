import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePolls, useVotePoll } from "@/hooks/usePolls";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Polls = () => {
  const [changing,setChanging] = useState<string>('');
  const [formQ,setFormQ] = useState('');
  const [formOpts,setFormOpts] = useState<string[]>(['','']);
  const [fb,setFb] = useState<{[id:string]:string}>({});
  const qc = useQueryClient();
  const createPoll = useMutation({
    mutationFn: async (data:{question:string; options:string[]})=>{await api.post('/polls',data);},
    onSuccess:()=>{qc.invalidateQueries({queryKey:['polls']});}
  });
  const deletePoll = useMutation({mutationFn: async(id:string)=>{await api.delete(`/polls/${id}`);},onSuccess:()=>qc.invalidateQueries({queryKey:['polls']})});
  const addFeedback= useMutation({mutationFn: async({id,text}:{id:string;text:string})=>{await api.post(`/polls/${id}/feedback`,{text});},onSuccess:()=>qc.invalidateQueries({queryKey:['polls']})});
  const { user } = useAuth();
  const { data: polls = [], isLoading } = usePolls();
  const voteMut = useVotePoll();
  const [selected, setSelected] = useState<{ [id: string]: number }>({});

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <div className="bg-blue-600 px-4 py-3 rounded-xl shadow flex flex-col items-center text-white mb-4">
            <span className="text-xl md:text-2xl font-bold leading-tight">Campus Polls &amp; Feedback</span>
          </div>
        {/* Admin create poll */}
        {user?.role==='admin' && (
          <Card className="p-6 space-y-4">
            <h2 className="font-medium">Create Poll</h2>
            <Input placeholder="Question" value={formQ} onChange={e=>setFormQ(e.target.value)}/>
            {formOpts.map((o,i)=>(<Input key={i} placeholder={`Option ${i+1}`} value={o} onChange={e=>setFormOpts(formOpts.map((v,idx)=>idx===i?e.target.value:v))}/>))}
            <Button size="sm" variant="secondary" onClick={()=>setFormOpts([...formOpts,''])}>Add Option</Button>
            <Button disabled={createPoll.isPending} onClick={()=>createPoll.mutate({question:formQ,options:formOpts.filter(Boolean)})}>Create</Button>
          </Card>
        )}
        {polls.length===0 && <p>No polls yet.</p>}
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((a, o) => a + o.votes, 0) || 1;
          const alreadyVoted = poll.voters?.includes(user?.id as any);
const canChange = alreadyVoted && !poll.changedOnce?.includes(user?.id as any);
          return (
            <Card key={poll._id} className="p-6 space-y-4">
              <h2 className="font-medium text-lg">{poll.question}</h2>
              {poll.options.map((opt, idx) => {
                const pct = Math.round((opt.votes / totalVotes) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{opt.text}</span>
                      <span className="text-sm text-muted-foreground">{pct}%</span>
                    </div>
                    <Progress value={pct} className="max-w-md" />
                  </div>
                );
              })}
              {!alreadyVoted && (
                <div className="flex flex-col md:flex-row gap-2">
                  {poll.options.map((opt, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      disabled={voteMut.isPending}
                      onClick={() => voteMut.mutate({ id: poll._id, optionIndex: idx })}
                    >
                      {opt.text}
                    </Button>
                  ))}
                  <Button
                    disabled={selected[poll._id] === undefined || voteMut.isPending}
                    onClick={() => {
                      voteMut.mutate({ id: poll._id, optionIndex: selected[poll._id] });
                    }}
                  >
                    Vote
                  </Button>
                </div>
              )}
              {canChange && changing!==poll._id && (
                <div className="space-y-2">
                  <Button size="sm" variant="outline" onClick={()=> setChanging(poll._id)}>Change Vote</Button>
                </div>
              )}
              {changing===poll._id && (
                <div className="flex flex-col md:flex-row gap-2">
                  {poll.options.map((opt, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={selected[poll._id]===idx?"secondary":"default"}
                      disabled={voteMut.isPending}
                      onClick={() => setSelected({ ...selected, [poll._id]: idx })}
                    >
                      {opt.text}
                    </Button>
                  ))}
                  <Button
                    disabled={selected[poll._id] === undefined || voteMut.isPending}
                    onClick={() => {
                      voteMut.mutate(
                        { id: poll._id, optionIndex: selected[poll._id] },
                        { onSuccess: () => setChanging("") }
                      );
                    }}
                  >
                    Update Vote
                  </Button>
                </div>
              )}
              {(user?.id===poll.createdBy || user?.role==='admin') && (
                <div className="space-y-2">
                  <Textarea placeholder="Add feedback" value={fb[poll._id]||''} onChange={e=>setFb({...fb,[poll._id]:e.target.value})}/>
                  <Button size="sm" onClick={()=>addFeedback.mutate({id:poll._id,text:fb[poll._id]})}>Submit Feedback</Button>
                  <Button variant="destructive" size="sm" onClick={()=>deletePoll.mutate(poll._id)}>Delete Poll</Button>
                  {poll.feedbacks.map((f,i)=>(<p key={i} className="text-sm text-muted-foreground">{new Date(f.createdAt).toLocaleString()} - {f.text}</p>))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default Polls;
