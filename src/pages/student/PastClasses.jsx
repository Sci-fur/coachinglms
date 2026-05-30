import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import {
  Search, Play, Calendar, Clock, User, Film, ExternalLink,
  Loader2, Video, Radio,
} from "lucide-react";

export default function PastClasses() {
  const [tab, setTab] = useState("upcoming");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["live-classes"],
    queryFn: async () => {
      const { data } = await client.get("/live-classes/student");
      return data.data;
    },
  });

  const items = tab === "upcoming" ? data?.upcoming || [] : data?.past || [];
  const filtered = items.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Live Classes</h1>
          <p className="text-sm text-slate-500">Upcoming sessions and past class recordings</p>
        </div>
        <div className="relative max-w-[180px] sm:ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary" />
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab("upcoming")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${tab === "upcoming" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
          <Radio className="h-3.5 w-3.5 inline mr-1.5" />
          Upcoming ({data?.upcoming?.length || 0})
        </button>
        <button onClick={() => setTab("past")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${tab === "past" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
          <Film className="h-3.5 w-3.5 inline mr-1.5" />
          Recordings ({data?.past?.length || 0})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            {tab === "upcoming" ? <Radio className="h-6 w-6 text-slate-400" /> : <Film className="h-6 w-6 text-slate-400" />}
          </div>
          <p className="font-semibold text-slate-600">
            {tab === "upcoming" ? "No upcoming classes" : "No past recordings"}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {tab === "upcoming" ? "Check back later for scheduled sessions" : "Recordings will appear after classes end"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-[#0D9488]/20 hover:shadow-sm transition-all group">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                tab === "upcoming" ? "bg-amber-50" : "bg-gradient-to-br from-[#0D9488]/10 to-[#0F766E]/10"
              }`}>
                {tab === "upcoming" ? (
                  <Radio className="h-5 w-5 text-amber-500" />
                ) : (
                  <Film className="h-5 w-5 text-[#0D9488]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-800 truncate">{c.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                  {c.course?.name && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600">{c.course.name}</span>
                  )}
                  {c.teacher && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{c.teacher}</span>}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.date).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{c.startTime}{c.endTime ? ` - ${c.endTime}` : ""}</span>
                  {c.subject && <span className="text-slate-400">{c.subject}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {tab === "upcoming" && c.meetingLink && (
                  <a
                    href={c.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all"
                  >
                    <Video className="h-3.5 w-3.5" /> Join
                  </a>
                )}
                {tab === "past" && c.recordingUrl && (
                  <a
                    href={c.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-bold text-[#0D9488] border border-[#0D9488] hover:bg-[#0D9488]/5 transition-all"
                  >
                    <Play className="h-3.5 w-3.5" /> Watch
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
