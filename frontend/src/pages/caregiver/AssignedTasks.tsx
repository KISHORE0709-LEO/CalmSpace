import { useState, useMemo } from "react";
import { CaregiverShell } from "@/components/CaregiverShell";
import { 
  CheckCircle2, Circle, Clock, MessageSquare, Send, Calendar, 
  CheckSquare, AlertCircle, ListTodo, Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Priority = "High" | "Medium" | "Low";
type Role = "Parent" | "Doctor";
type TaskStatus = "pending" | "completing" | "completed";

interface Task {
  id: string;
  title: string;
  assignedBy: { name: string; role: Role };
  dueWindow: "Today" | "This week";
  priority: Priority;
  status: TaskStatus;
  note?: string;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Practice Social Practice — World 1, Level 3",
    assignedBy: { name: "Dr. Mehta", role: "Doctor" },
    dueWindow: "Today",
    priority: "High",
    status: "pending",
  },
  {
    id: "2",
    title: "Encourage 10 min outdoor sensory time",
    assignedBy: { name: "Mr. Jenkins", role: "Parent" },
    dueWindow: "Today",
    priority: "Medium",
    status: "pending",
  },
  {
    id: "3",
    title: "Complete one breathing exercise before lunch",
    assignedBy: { name: "Dr. Mehta", role: "Doctor" },
    dueWindow: "Today",
    priority: "High",
    status: "completed",
    note: "Completed successfully. Rahul was very calm.",
  },
  {
    id: "4",
    title: "Try the new Emotion Match game",
    assignedBy: { name: "Dr. Mehta", role: "Doctor" },
    dueWindow: "This week",
    priority: "Low",
    status: "pending",
  },
  {
    id: "5",
    title: "Review daily schedule visually",
    assignedBy: { name: "Mr. Jenkins", role: "Parent" },
    dueWindow: "This week",
    priority: "Medium",
    status: "pending",
  },
];

const AssignedTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleToggleCheckbox = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (t.status === "pending") return { ...t, status: "completing" };
          if (t.status === "completing") return { ...t, status: "pending" };
        }
        return t;
      })
    );
  };

  const handleSaveNoteAndComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: "completed", note: tempNotes[taskId] || "" }
          : t
      )
    );
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

    // Sort: Pending first, then completed. Then High priority first.
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
            onClick={() => !isCompleted && handleToggleCheckbox(task.id)}
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
              task.assignedBy.role === 'Doctor' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-orange-100 text-orange-800 border-orange-300'
            }`}>
              {task.assignedBy.name} ({task.assignedBy.role})
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
                placeholder="How did Rahul do?"
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
        
      </div>
    </CaregiverShell>
  );
};

export default AssignedTasks;
