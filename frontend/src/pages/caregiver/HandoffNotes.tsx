import { useState, useEffect } from "react";
import { CaregiverShell } from "@/components/CaregiverShell";
import { 
  FilePlus, AlertCircle, Thermometer, UtensilsCrossed, Smile, Moon, 
  MoreVertical, CheckCircle2, Circle, MessageSquare, ClipboardCheck, Edit2, Trash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HandoffNote {
  id: string;
  author: string;
  authorRole: string;
  category: "Medical" | "Behavioral" | "Routine";
  title: string;
  content: string;
  createdAt: any;
}

const HandoffNotes = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"All" | "Medical" | "Behavioral">("All");
  const [notes, setNotes] = useState<HandoffNote[]>([]);
  
  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ title: "", content: "", category: "Routine" as any });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "handoff_notes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HandoffNote));
      setNotes(fetched);
    });
    return () => unsubscribe();
  }, [user]);

  const handleOpenAddModal = () => {
    setEditingNoteId(null);
    setNoteForm({ title: "", content: "", category: "Routine" });
    setIsNoteModalOpen(true);
  };

  const handleOpenEditModal = (note: HandoffNote) => {
    setEditingNoteId(note.id);
    setNoteForm({ title: note.title, content: note.content, category: note.category });
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.title || !noteForm.content) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSaving(true);
    try {
      if (editingNoteId) {
        await updateDoc(doc(db, "handoff_notes", editingNoteId), {
          title: noteForm.title,
          content: noteForm.content,
          category: noteForm.category
        });
        toast.success("Note updated");
      } else {
        await addDoc(collection(db, "handoff_notes"), {
          title: noteForm.title,
          content: noteForm.content,
          category: noteForm.category,
          author: user?.displayName || "Caregiver",
          authorRole: "Caregiver",
          createdAt: serverTimestamp()
        });
        toast.success("Note added");
      }
      setIsNoteModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteDoc(doc(db, "handoff_notes", id));
      toast.success("Note deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete note");
    }
  };

  const filteredNotes = notes.filter(n => filter === "All" || n.category === filter);

  return (
    <CaregiverShell title="" subtitle="" fullWidth>
      <div className="w-full max-w-[96%] mx-auto pt-4 h-full flex flex-col pb-24 relative animate-fade-up">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">Handoff Notes</h1>
            <p className="text-muted-foreground font-medium text-lg max-w-xl">
              Coordinating continuity of care through detailed shift transitions and team observations.
            </p>
          </div>
          <button onClick={handleOpenAddModal} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black text-sm py-3 px-6 rounded-xl border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all flex items-center gap-2 self-start">
            <FilePlus className="w-5 h-5" /> Create New Note
          </button>
        </div>

        {/* URGENT REMINDERS (Static for now) */}
        <div className="mb-8">
          <div className="bg-red-50/50 border-4 border-destructive/50 rounded-[2rem] p-6 sm:p-8">
            <h2 className="text-2xl font-black text-destructive flex items-center gap-3 mb-6 tracking-tight">
              <AlertCircle className="w-6 h-6" strokeWidth={3} /> Urgent Reminders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background rounded-2xl border-l-4 border-l-destructive border-y-2 border-r-2 border-foreground/10 p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-12 bg-destructive/10 flex items-center justify-center border-r-2 border-foreground/10">
                  <Thermometer className="text-destructive w-6 h-6" />
                </div>
                <div className="pl-16">
                  <h3 className="font-black text-destructive text-sm uppercase tracking-widest mb-1">Health Alert</h3>
                  <p className="text-sm font-bold text-foreground leading-relaxed">
                    Leo has a mild fever (100.2°F) since 10:00 AM. Monitor closely and hydrate.
                  </p>
                </div>
              </div>
              <div className="bg-background rounded-2xl border-l-4 border-l-destructive border-y-2 border-r-2 border-foreground/10 p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-12 bg-destructive/10 flex items-center justify-center border-r-2 border-foreground/10">
                  <UtensilsCrossed className="text-destructive w-6 h-6" />
                </div>
                <div className="pl-16">
                  <h3 className="font-black text-destructive text-sm uppercase tracking-widest mb-1">Dietary Restriction</h3>
                  <p className="text-sm font-bold text-foreground leading-relaxed">
                    Avoid dairy during lunch today. Substitute with oat milk if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* CARE TEAM FEED */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-black text-foreground">Care Team Feed</h3>
                <div className="flex gap-2">
                  {(["All", "Medical", "Behavioral"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                        filter === f ? "bg-primary text-primary-foreground border-foreground shadow-sm" : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredNotes.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground font-bold border-2 border-dashed border-border rounded-xl">
                    No handoff notes found. Create one to get started.
                  </div>
                ) : (
                  filteredNotes.map(note => (
                    <div key={note.id} className="calm-card bg-background border-4 border-foreground rounded-[2rem] shadow-pop-sm p-6 sm:p-8 animate-fade-up">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-foreground overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-black">
                            {note.author.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-base text-foreground">{note.author}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {note.createdAt ? new Date(note.createdAt.toDate()).toLocaleString() : "Just now"} • {note.category}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-2 border-foreground rounded-xl shadow-pop">
                            <DropdownMenuItem onClick={() => handleOpenEditModal(note)} className="font-bold cursor-pointer">
                              <Edit2 className="w-4 h-4 mr-2" /> Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteNote(note.id)} className="font-bold text-red-600 cursor-pointer focus:text-red-600">
                              <Trash className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <h5 className="font-black text-lg text-foreground mb-2">{note.title}</h5>
                      <p className="text-sm font-bold text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">
                        {note.content}
                      </p>

                      <div className="flex gap-2">
                        <span className="bg-muted px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-foreground">
                          {note.category} Note
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="calm-card bg-background border-4 border-foreground shadow-pop-lg rounded-[2rem] p-6 sm:p-8 flex flex-col relative overflow-hidden">
              <div className="flex items-start gap-3 mb-8">
                <ClipboardCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                <h3 className="text-2xl font-black text-foreground leading-tight">End of Shift Checklist</h3>
              </div>
              <div className="space-y-6 mb-10 flex-1">
                {["Medications Administered & Logged", "Nutrition Intake Recorded", "Play Area Tidied", "Laundry Cycle Started", "Handoff Note Published"].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group cursor-pointer">
                    <Circle className="w-6 h-6 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                    <span className="font-bold text-sm text-foreground/80 group-hover:text-foreground transition-colors pt-0.5 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4 mt-auto">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base py-4 rounded-xl border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 fill-current" /> Finalize Handoff
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-xl bg-card border-2 border-foreground shadow-pop sm:rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{editingNoteId ? "Edit Handoff Note" : "New Handoff Note"}</DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              Log important observations for the next shift.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Category</label>
              <Select value={noteForm.category} onValueChange={(v: any) => setNoteForm({...noteForm, category: v})}>
                <SelectTrigger className="border-2 border-foreground h-12 rounded-xl font-bold bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Behavioral">Behavioral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Title</label>
              <Input 
                value={noteForm.title}
                onChange={e => setNoteForm({...noteForm, title: e.target.value})}
                placeholder="e.g. Naptime update"
                className="border-2 border-foreground h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Details</label>
              <Textarea 
                value={noteForm.content}
                onChange={e => setNoteForm({...noteForm, content: e.target.value})}
                placeholder="Write your observations..."
                className="border-2 border-foreground rounded-xl min-h-[120px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)} className="font-black border-2 border-foreground h-12 rounded-xl">Cancel</Button>
            <Button onClick={handleSaveNote} disabled={isSaving} className="font-black border-2 border-foreground bg-primary h-12 rounded-xl shadow-pop-sm hover:-translate-y-1">
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CaregiverShell>
  );
};

export default HandoffNotes;
