import { useState, useMemo, useEffect } from "react";
import { CaregiverShell } from "@/components/CaregiverShell";
import { 
  CheckCircle2, Circle, Clock, MessageSquare, Send, Calendar, 
  CheckSquare, AlertCircle, ListTodo, Search, Filter, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Priority = "High" | "Medium" | "Low";
type Role = "Parent" | "Doctor" | "Caregiver";
type TaskStatus = "pending" | "completing" | "completed";

interface Task {
  id: string;
  title: string;
  assignedBy: { name: string; role: Role };
  dueWindow: "Today" | "This week";
  priority: Priority;
  status: TaskStatus;
  note?: string;
  createdAt?: any;
}

const AssignedTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Add task state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "Medium" as Priority, dueWindow: "Today" as "Today"|"This week" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetchedTasks);
    });
    return () => unsubscribe();
  }, [user]);

  const handleToggleCheckbox = async (taskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === "pending" ? "completing" : "pending";
    try {
      await updateDoc(doc(db, "tasks", taskId), { status: newStatus });
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  const handleSaveNoteAndComplete = async (taskId: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status: "completed",
        note: tempNotes[taskId] || ""
      });
      toast.success("Task completed!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to complete task");
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title) {
      toast.error("Please enter a task title");
      return;
    }
    setIsAdding(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title: newTask.title,
        assignedBy: { name: user?.displayName || "Caregiver", role: "Caregiver" },
        dueWindow: newTask.dueWindow,
        priority: newTask.priority,
        status: "pending",
        createdAt: serverTimestamp()
      });
      toast.success("Task added successfully");
      setIsAddModalOpen(false);
      setNewTask({ title: "", priority: "Medium", dueWindow: "Today" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to add task");
    } finally {
      setIsAdding(false);
    }
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase())
    );

    if (filterType === "today") result = result.filter(t => t.dueWindow === "Today");
    if (filterType === "week") result = result.filter(t => t.dueWindow === "This week");
    if (filterType === "high") result = result.filter(t => t.priority === "High");
    if (filterType === "pending") result = result.filter(t => t.status !== "completed");
    if (filterType === "completed") result = result.filter(t => t.status === "completed");

    result.sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    return result;
  }, [tasks, search, filterType]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status !== "completed").length,
    completed: tasks.filter(t => t.status === "completed").length,
    today: tasks.filter(t => t.dueWindow === "Today" && t.status !== "completed").length
  };

  const renderTaskCard = (task: Task, index: number) => {
    const isCompleting = task.status === "completing";
    const isCompleted = task.status === "completed";

    return (
      <div 
        key={task.id} 
        className={`calm-card bg-white p-6 transition-all relative overflow-hidden animate-fade-up-delay-${(index % 4) + 1} ${
          isCompleted ? 'opacity-70 grayscale-[30%] hover:grayscale-0' : 'hover:-translate-y-1 hover:shadow-pop group'
        }`}
      >
        {isCompleted && (
          <div className="absolute top-0 right-0 p-4">
             <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 border-green-200">
                Done
             </div>
          </div>
        )}

        <div className="flex items-start gap-4 mb-4 pr-16">
          <button 
            onClick={() => !isCompleted && handleToggleCheckbox(task.id, task.status)}
            disabled={isCompleted}
            className="mt-1 flex-shrink-0 focus:outline-none transition-transform hover:scale-110 active:scale-95 disabled:hover:scale-100 disabled:opacity-50"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-8 h-8 text-green-500 fill-green-100" />
            ) : isCompleting ? (
              <CheckCircle2 className="w-8 h-8 text-primary fill-primary/10 animate-pulse" />
            ) : (
              <Circle className="w-8 h-8 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>
          
          <div>
            <h3 className={`text-xl font-black leading-tight ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-background border-2 border-border/50">
            <span className="text-sm font-bold text-muted-foreground">Assigned By</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
              task.assignedBy?.role === 'Doctor' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-orange-100 text-orange-800 border-orange-300'
            }`}>
              {task.assignedBy?.name || 'Unknown'} ({task.assignedBy?.role || 'Unknown'})
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-background border-2 border-border/50">
            <span className="text-sm font-bold text-muted-foreground">Due</span>
            <div className="flex items-center gap-1.5 font-bold text-sm bg-muted px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {task.dueWindow}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-background border-2 border-border/50">
            <span className="text-sm font-bold text-muted-foreground">Priority</span>
            <div className="flex items-center gap-2 font-bold bg-muted px-3 py-1 rounded-full text-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${
                task.priority === 'High' ? 'bg-red-500' : 
                task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              {task.priority}
            </div>
          </div>
        </div>

        {/* Completing State: Note Field */}
        {isCompleting && (
          <div className="mt-4 pt-4 border-t-2 border-border/50 animate-fade-up">
            <label className="text-xs font-bold text-primary mb-2 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Add a note (Optional)
            </label>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                value={tempNotes[task.id] || ""}
                onChange={(e) => setTempNotes({ ...tempNotes, [task.id]: e.target.value })}
                placeholder="How did they do?"
                className="w-full h-10 border-2 border-foreground rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              <Button 
                onClick={() => handleSaveNoteAndComplete(task.id)}
                className="w-full bg-primary text-primary-foreground font-black rounded-lg border-2 border-foreground shadow-pop-sm h-10"
              >
                Mark as Done <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Completed Note Display */}
        {isCompleted && task.note && (
          <div className="mt-4 pt-4 border-t-2 border-border/50 flex gap-2 items-start text-sm font-bold text-muted-foreground">
            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="italic">"{task.note}"</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <CaregiverShell title="Assigned Tasks" subtitle="Tasks and goals for the current session" fullWidth>
      <div className="pt-8 pb-12 animate-fade-up max-w-[1800px] mx-auto px-4">
        
        <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddModalOpen(true)} className="h-12 rounded-xl font-black shadow-pop-sm border-2 border-foreground bg-primary hover:-translate-y-1 transition-all">
                <Plus className="w-5 h-5 mr-2" /> Add Task
            </Button>
        </div>

        {/* Top Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="calm-card p-6 flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center border-2 border-primary/20">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-black">{stats.total}</p>
            </div>
          </div>
          <div className="calm-card p-6 flex items-center gap-4 bg-orange-50">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center border-2 border-orange-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">Due Today</p>
              <p className="text-2xl font-black text-orange-900">{stats.today}</p>
            </div>
          </div>
          <div className="calm-card p-6 flex items-center gap-4 bg-yellow-50">
            <div className="w-12 h-12 rounded-xl bg-yellow-200 text-yellow-700 flex items-center justify-center border-2 border-yellow-300">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">Pending</p>
              <p className="text-2xl font-black text-yellow-900">{stats.pending}</p>
            </div>
          </div>
          <div className="calm-card p-6 flex items-center gap-4 bg-green-50">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center border-2 border-green-200">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">Completed</p>
              <p className="text-2xl font-black text-green-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white calm-card p-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 border-2 border-foreground shadow-pop-sm rounded-xl text-base font-bold bg-background"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[220px] h-12 border-2 border-foreground shadow-pop-sm rounded-xl font-black bg-background">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <SelectValue placeholder="Filter tasks" />
                </div>
              </SelectTrigger>
              <SelectContent className="border-2 border-foreground rounded-xl shadow-pop">
                <SelectItem value="all" className="font-bold">All Tasks</SelectItem>
                <SelectItem value="today" className="font-bold">Due Today</SelectItem>
                <SelectItem value="week" className="font-bold">Due This Week</SelectItem>
                <SelectItem value="high" className="font-bold">High Priority</SelectItem>
                <SelectItem value="pending" className="font-bold">Pending Only</SelectItem>
                <SelectItem value="completed" className="font-bold">Completed Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white calm-card">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ListTodo className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-2xl font-black text-foreground">No tasks found</p>
              <p className="text-muted-foreground font-bold mt-2">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            filteredTasks.map((task, index) => renderTaskCard(task, index))
          )}
        </div>
        
        {/* Add Task Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-md bg-card border-2 border-foreground shadow-pop sm:rounded-[1.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Add New Task</DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">
                Assign a new task or goal.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Task Title</label>
                <Input 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g. 10 min sensory break"
                  className="border-2 border-foreground h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Priority</label>
                <Select value={newTask.priority} onValueChange={(val: Priority) => setNewTask({...newTask, priority: val})}>
                  <SelectTrigger className="border-2 border-foreground h-12 rounded-xl font-bold bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Due Window</label>
                <Select value={newTask.dueWindow} onValueChange={(val: "Today" | "This week") => setNewTask({...newTask, dueWindow: val})}>
                  <SelectTrigger className="border-2 border-foreground h-12 rounded-xl font-bold bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Today">Today</SelectItem>
                    <SelectItem value="This week">This week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="font-black border-2 border-foreground h-12 rounded-xl">Cancel</Button>
              <Button onClick={handleAddTask} disabled={isAdding} className="font-black border-2 border-foreground bg-primary h-12 rounded-xl shadow-pop-sm hover:-translate-y-1">
                {isAdding ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CaregiverShell>
  );
};

export default AssignedTasks;
