import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import {
  FileCheck, Clock, CheckCircle, AlertCircle, BookOpen,
  ArrowRight, ClipboardList, Loader2,
} from "lucide-react";

export default function Exams() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("upcoming");

  const { data: exams, isLoading } = useQuery({
    queryKey: ["student-exams"],
    queryFn: async () => {
      const { data } = await client.get("/student/exams");
      return data.data;
    },
  });

  const { data: results } = useQuery({
    queryKey: ["student-results"],
    queryFn: async () => {
      const { data } = await client.get("/student/results");
      return data.data;
    },
  });

  const attemptedIds = new Set(
    (results || [])
      .filter((r) => r.status === "submitted" || r.status === "graded")
      .map((r) => r.exam?._id)
  );

  const upcoming = (exams || []).filter((e) => !attemptedIds.has(e._id));
  const completed = results || [];

  const display = tab === "upcoming" ? upcoming : completed;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Exams & Practice</h1>
        <p className="text-sm text-slate-500">Review past exams or take new practice tests</p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab("upcoming")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${tab === "upcoming" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
          Upcoming ({upcoming.length})
        </button>
        <button onClick={() => setTab("completed")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${tab === "completed" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
          Completed ({completed.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : display.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3"><FileCheck className="h-6 w-6 text-slate-400" /></div>
          <p className="font-semibold text-slate-600">{tab === "upcoming" ? "No upcoming exams" : "No completed exams yet"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {tab === "upcoming" ? (
            display.map((e) => (
              <div key={e._id} className="bg-white rounded-xl border border-slate-200 p-5 card-lift">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-800">{e.title || "Untitled Assessment"}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{e.course?.name || ""}</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    <Clock className="h-3 w-3" /> Pending
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3" />{e.totalMarks != null ? `${e.totalMarks} marks` : "—"}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{e.duration != null ? `${e.duration} min` : "—"}</span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/dashboard/exams/${e._id}/take`)}
                    className="w-full h-9 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer"
                  >
                    Start Exam <ArrowRight className="h-3 w-3 inline ml-1" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            display.map((r) => {
              const exam = r.exam || {};
              const score = r.totalMarksObtained ?? 0;
              const total = exam.totalMarks;
              const pct = total > 0 && score <= total ? (score / total) * 100 : total > 0 && score > total ? 100 : 0;
              const displayPct = Math.min(pct, 100);
              const passed = r.passed;
              const marksLabel = total != null ? `${total} marks` : "—";
              const durationLabel = exam.duration != null ? `${exam.duration} min` : "—";
              return (
                <div key={r._id} className="bg-white rounded-xl border border-slate-200 p-5 card-lift">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-800">{exam.title || "Untitled Assessment"}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{exam.course?.name || ""}</p>
                    </div>
                    {r.status === "graded" ? (
                      <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${displayPct >= 80 ? "bg-emerald-50 text-emerald-700" : displayPct >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                        {passed ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {displayPct.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        <BookOpen className="h-3 w-3" /> Practice
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3" />{marksLabel}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{durationLabel}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{r.status === "graded" ? "Score" : "MCQ Score"}</span>
                      <span className="font-bold text-slate-800">{score}{total != null ? `/${total}` : ""}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${passed ? "bg-gradient-to-r from-[#0D9488] to-[#0F766E]" : "bg-gradient-to-r from-red-500 to-amber-500"}`} style={{ width: `${displayPct}%` }} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => navigate(`/dashboard/exams/${r.exam?._id}/take`)}
                      className="w-full h-9 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer"
                    >
                      View Results <ArrowRight className="h-3 w-3 inline ml-1" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
