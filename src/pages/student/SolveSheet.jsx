import { useState } from "react";
import { Search, Download, FileText, ChevronDown, BookOpen } from "lucide-react";

const sheets = [
  { title: "Algebraic Expressions — Solution Key", subject: "Mathematics", chapter: "Algebra", pages: 8, downloads: 234, type: "pdf" },
  { title: "Quadratic Equations — Step by Step", subject: "Mathematics", chapter: "Algebra", pages: 12, downloads: 189, type: "pdf" },
  { title: "Newton's Laws — Problem Solutions", subject: "Physics", chapter: "Force & Motion", pages: 6, downloads: 156, type: "pdf" },
  { title: "Chemical Equations — Balancing Practice", subject: "Chemistry", chapter: "Reactions", pages: 10, downloads: 198, type: "pdf" },
  { title: "English Grammar — Tense Exercises", subject: "English", chapter: "Grammar", pages: 5, downloads: 267, type: "pdf" },
  { title: "Bangla — Kobita Bishleshon Notes", subject: "Bangla", chapter: "Literature", pages: 7, downloads: 145, type: "pdf" },
  { title: "Trigonometry Formulas & Examples", subject: "Mathematics", chapter: "Trigonometry", pages: 9, downloads: 312, type: "pdf" },
  { title: "Cell Division — Diagram & Answers", subject: "Biology", chapter: "Cell Biology", pages: 4, downloads: 123, type: "pdf" },
  { title: "SSC Board Question 2026 — Full Solution", subject: "Mathematics", chapter: "Board Exam", pages: 20, downloads: 567, type: "pdf" },
  { title: "Periodic Table — Memory Sheet", subject: "Chemistry", chapter: "Periodicity", pages: 3, downloads: 421, type: "pdf" },
];

const subjects = ["All", "Mathematics", "Physics", "Chemistry", "English", "Bangla", "Biology"];

export default function SolveSheet() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");

  const filtered = sheets.filter((s) => {
    const match = s.title.toLowerCase().includes(search.toLowerCase());
    if (subject === "All") return match;
    return match && s.subject === subject;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Solve Sheet</h1>
          <p className="text-sm text-slate-500">Download solution keys and exam explanations</p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <div className="relative max-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary" />
          </div>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none">
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-[#0D9488]/20 hover:shadow-sm transition-all group">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 truncate">{s.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600">{s.subject}</span>
                <span>{s.chapter}</span>
                <span>{s.pages} pages</span>
                <span className="hidden sm:inline">{s.downloads} downloads</span>
              </div>
            </div>
            <button className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0F766E] hover:shadow-lg transition-all cursor-pointer">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
