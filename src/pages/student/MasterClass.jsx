import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, GraduationCap, Clock, Users, ArrowRight, ChevronRight, Star,
} from "lucide-react";

const programs = [
  { title: "Foundation Mathematics", subtitle: "Core math skills for SSC & beyond", level: "Class 6-8", students: 184, lessons: 24, duration: "3 months", type: "foundation", color: "from-blue-600 to-indigo-700", emoji: "🧮" },
  { title: "Foundation English", subtitle: "Grammar, reading & writing fundamentals", level: "Class 6-8", students: 210, lessons: 20, duration: "3 months", type: "foundation", color: "from-emerald-600 to-teal-700", emoji: "📝" },
  { title: "Foundation Science", subtitle: "Physics, Chemistry & Biology basics", level: "Class 6-8", students: 156, lessons: 30, duration: "4 months", type: "foundation", color: "from-violet-600 to-purple-700", emoji: "🔬" },
  { title: "Master Class: Higher Math", subtitle: "Advanced algebra, geometry & trigonometry", level: "Class 9-10", students: 98, lessons: 18, duration: "2 months", type: "master", color: "from-rose-600 to-pink-700", emoji: "📐" },
  { title: "Master Class: English Literature", subtitle: "Poetry, drama & critical analysis", level: "Class 9-10", students: 72, lessons: 15, duration: "2 months", type: "master", color: "from-amber-600 to-orange-700", emoji: "📖" },
  { title: "Master Class: Physics", subtitle: "Motion, electricity & modern physics", level: "Class 9-10", students: 85, lessons: 22, duration: "3 months", type: "master", color: "from-cyan-600 to-blue-700", emoji: "⚡" },
];

export default function MasterClass() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = programs.filter((p) => {
    const match = p.title.toLowerCase().includes(search.toLowerCase()) || p.subtitle.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return match;
    return match && p.type === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Master & Foundation Class</h1>
          <p className="text-sm text-slate-500">Specialized programs to build strong fundamentals</p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <div className="relative max-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none">
            <option value="all">All</option>
            <option value="foundation">Foundation</option>
            <option value="master">Master Class</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <div key={i} className="group bg-white rounded-xl border border-slate-200 overflow-hidden card-lift">
            <div className={`h-1.5 bg-gradient-to-r ${p.color}`} />
            <div className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl shrink-0">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-800">{p.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.subtitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  <Star className="h-3 w-3 text-amber-500" /> {p.level}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" /> {p.duration}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  <Users className="h-3 w-3" /> {p.students}
                </span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">{p.lessons} lessons</span>
                <Link to="/register" className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all">
                  Enroll <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
