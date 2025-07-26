import Header from '@/components/Header';
import socket from '@/services/socket';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage { user:string; text:string; createdAt:string; }

const GroupChat = () => {
  const { user } = useAuth();
  const [messages,setMessages] = useState<ChatMessage[]>([]);
  const [text,setText] = useState('');

  useEffect(()=>{
    socket.connect();
    socket.emit('join-room','global');
    socket.on('chat-message',(msg:ChatMessage)=>{
      setMessages(prev=>[...prev,msg]);
    });
    return ()=>{socket.off('chat-message'); socket.disconnect();};
  },[]);

  const send = ()=>{
    if(!text) return;
    const msg={room:'global', user:user?.name||'Anon', text, createdAt:new Date().toISOString()};
    socket.emit('chat-message',msg);
    setText('');
  };

  return (
    <>
      <Header/>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold">Campus Group Chat</h1>
        <Card className="p-4 h-[60vh] overflow-y-auto flex flex-col space-y-2">
          {messages.map((m,i)=>(
            <div key={i} className="text-sm"><span className="font-medium mr-1">{m.user}:</span>{m.text}</div>
          ))}
        </Card>
        <div className="flex gap-2">
          <Input value={text} onChange={e=>setText(e.target.value)} placeholder="Message" className="flex-1"/>
          <Button onClick={send}>Send</Button>
        </div>
      </div>
    </>
  );
};

export default GroupChat;
