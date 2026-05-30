import { useState } from "react";
import {
  MessageCircle, Users, ChevronRight, Search, Clock,
  User,
} from "lucide-react";

const groups = [
  { name: "SSC 2026 Science Group", members: 234, lastActive: "2 min ago", posts: 45, description: "Discussion forum for SSC 2026 Science batch students", color: "from-emerald-600 to-teal-700" },
  { name: "College Admission Prep", members: 189, lastActive: "15 min ago", posts: 32, description: "Admission test preparation & college counseling", color: "from-violet-600 to-purple-700" },
  { name: "Mathematics Problem Solving", members: 312, lastActive: "5 min ago", posts: 78, description: "Solve math problems together, share tips & tricks", color: "from-blue-600 to-indigo-700" },
  { name: "English Language Club", members: 156, lastActive: "1 hour ago", posts: 23, description: "Improve English speaking, writing & reading skills", color: "from-amber-600 to-orange-700" },
  { name: "Physics & Chemistry Lab", members: 98, lastActive: "3 hours ago", posts: 15, description: "Science experiments, lab reports & discussions", color: "from-rose-600 to-pink-700" },
  { name: "Exam Preparation Squad", members: 276, lastActive: "Just now", posts: 91, description: "Study together, share notes & ace your exams", color: "from-cyan-600 to-teal-700" },
];

export default function Community() {
  const [search, setSearch] = useState("");

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Discussion Group</h1>
          <p className="text-sm text-slate-500">Join groups, share notes, and discuss with peers</p>
        </div>
        <div className="relative max-w-[200px] sm:ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups..." className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((g, i) => (
          <div key={i} className="group bg-white rounded-xl border border-slate-200 overflow-hidden card-lift cursor-pointer">
            <div className={`h-1.5 bg-gradient-to-r ${g.color}`} />
            <div className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center shrink-0`}>
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{g.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{g.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{g.members}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{g.posts} posts</span>
                <span className="inline-flex items-center gap-1 ml-auto"><Clock className="h-3 w-3" />{g.lastActive}</span>
              </div>
              <div className="mt-3">
                <button className="w-full h-9 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer">
                  Join Group
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
