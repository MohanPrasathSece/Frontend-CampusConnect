import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useComplaints } from "@/hooks/useComplaints";
import api from "@/services/api";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface Complaint {
  _id: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
}

const ComplaintPage = () => {
  const { user } = useAuth();
  const { data: complaints = [], refetch } = useComplaints();

  const [filterStatus, setFilterStatus] = useState("all");

  const [showFile, setShowFile] = useState(false);
  const [form, setForm] = useState({ category: "general", description: "" });

  const handleSubmit = async () => {
    try {
      await api.post("/complaints", form);
      toast({ title: "Complaint filed" });
      setShowFile(false);
      setForm({ category: "general", description: "" });
      refetch();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const filtered = complaints.filter((c: Complaint) => (filterStatus === "all" ? true : c.status === filterStatus));

  const statusVariant = (s: string) => {
    switch (s) {
      case "Pending":
        return "warning";
      case "In Progress":
        return "info";
      case "Resolved":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Complaints</h1>
          <Button variant="campus-outline" onClick={() => setShowFile(true)}>
            File Complaint
          </Button>
        </div>

        <div className="flex gap-3 items-center">
          <label className="text-sm">Filter status</label>
          <select
            title="Complaint status filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded p-2"
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="space-y-4">
          {filtered.map((c: Complaint) => (
            <Card key={c._id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{c.category}</h2>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{c.description}</p>
                </div>
                <Badge variant={statusVariant(c.status) as any}>{c.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{dayjs(c.createdAt).format("DD MMM YYYY HH:mm")}</p>
              {user?.role === "admin" && (
                <div className="flex gap-2 mt-2">
                  {c.status !== "In Progress" && (
                    <Button
                      size="sm"
                      variant="info"
                      onClick={async () => {
                        await api.put(`/complaints/${c._id}/status`, { status: "In Progress" });
                        refetch();
                      }}
                    >
                      Mark In-Progress
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="success"
                    onClick={async () => {
                      await api.put(`/complaints/${c._id}/status`, { status: "Resolved" });
                      refetch();
                    }}
                  >
                    Resolve
                  </Button>
                  <Button size="icon" variant="ghost" onClick={async()=>{if(!window.confirm('Delete this complaint?')) return;
                    await api.delete(`/complaints/${c._id}`);refetch();}}>
                    <Trash className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* File complaint dialog */}
      <Dialog open={showFile} onOpenChange={setShowFile}>
        <DialogContent className="space-y-3">
          <DialogHeader>File Complaint</DialogHeader>
          <select
            title="Complaint category"
            className="border rounded p-2 w-full"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="general">General</option>
            <option value="facility">Facility</option>
            <option value="academic">Academic</option>
          </select>
          <textarea
            className="border rounded p-2 w-full"
            rows={4}
            placeholder="Describe issue"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <DialogFooter>
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComplaintPage;
