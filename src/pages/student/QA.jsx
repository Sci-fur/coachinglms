import { useState } from "react";
import {
  HelpCircle, MessageCircle, Plus, Send, CheckCircle,
  Clock, ChevronRight, User, Search,
} from "lucide-react";

const initialQuestions = [
  { id: 1, title: "How to solve quadratic equations with complex roots?", subject: "Mathematics", answers: 3, status: "answered", date: "May 22", author: "You" },
  { id: 2, title: "Explain Newton's Third Law with real-life examples", subject: "Physics", answers: 2, status: "answered", date: "May 20", author: "You" },
  { id: 3, title: "What is the difference between mitosis and meiosis?", subject: "Biology", answers: 0, status: "pending", date: "May 24", author: "You" },
  { id: 4, title: "How to balance chemical equations quickly?", subject: "Chemistry", answers: 1, status: "answered", date: "May 18", author: "You" },
  { id: 5, title: "Tips for writing a good English composition?", subject: "English", answers: 0, status: "pending", date: "May 25", author: "You" },
];

export default function QA() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [newQ, setNewQ] = useState({ title: "", subject: "Mathematics" });

  const filtered = questions.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newQ.title.trim()) return;
    setQuestions([
      { id: Date.now(), title: newQ.title, subject: newQ.subject, answers: 0, status: "pending", date: "Just now", author: "You" },
      ...questions,
    ]);
    setNewQ({ title: "", subject: "Mathematics" });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Q&A Service</h1>
          <p className="text-sm text-slate-500">Submit doubts and get answers from instructors</p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <div className="relative max-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary" />
          </div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Ask
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Ask a Question</h3>
          <div>
            <input
              value={newQ.title}
              onChange={(e) => setNewQ({ ...newQ, title: e.target.value })}
              placeholder="Type your question..."
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-3">
            <select value={newQ.subject} onChange={(e) => setNewQ({ ...newQ, subject: e.target.value })} className="h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none">
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="Bangla">Bangla</option>
            </select>
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button type="submit" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer">
                <Send className="h-3.5 w-3.5" /> Submit
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.map((q) => (
          <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-[#0D9488]/20 hover:shadow-sm transition-all group cursor-pointer">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${q.status === "answered" ? "bg-emerald-50" : "bg-amber-50"}`}>
              {q.status === "answered" ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <Clock className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 truncate">{q.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600">{q.subject}</span>
                <span>{q.date}</span>
                <span className={`font-medium ${q.status === "answered" ? "text-emerald-600" : "text-amber-600"}`}>
                  {q.answers > 0 ? `${q.answers} answer${q.answers > 1 ? "s" : ""}` : "No answers yet"}
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
