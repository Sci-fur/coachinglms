import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import {
  Loader2, TrendingUp, Target, Award, ClipboardCheck,
  ArrowUp, ArrowDown,
} from "lucide-react";

function StatCard({ label, value, icon: Icon, change, up }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-lift">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0D9488]/10 to-[#0F766E]/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-[#0D9488]" />
        </div>
      </div>
      {change && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${up ? "text-emerald-600" : "text-red-600"}`}>
          {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {change}
        </div>
      )}
    </div>
  );
}

export default function Performance() {
  const { data: results, isLoading } = useQuery({
    queryKey: ["student-results"],
    queryFn: async () => {
      const { data } = await client.get("/student/results");
      return data.data;
    },
  });

  const graded = (results || []).filter((r) => r.status === "graded");
  const avgPct = graded.length
    ? Math.round(graded.reduce((s, r) => s + (r.totalMarksObtained / (r.exam?.totalMarks || 1)) * 100, 0) / graded.length)
    : 0;

  const recentScores = graded.slice(0, 5).map((r) => ({
    exam: r.exam?.title || "Exam",
    subject: r.exam?.course?.name || "",
    score: r.totalMarksObtained,
    total: r.exam?.totalMarks || 0,
    pct: r.exam?.totalMarks ? Math.round((r.totalMarksObtained / r.exam.totalMarks) * 100) : 0,
    date: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
  }));

  const stats = [
    { label: "Exams Taken", value: String(graded.length), icon: ClipboardCheck, change: null, up: true },
    { label: "Average Score", value: `${avgPct}%`, icon: Target, change: null, up: true },
    { label: "Total Marks", value: String(graded.reduce((s, r) => s + (r.totalMarksObtained || 0), 0)), icon: Award, change: null, up: true },
    { label: "Completion", value: `${results?.length || 0} total`, icon: TrendingUp, change: null, up: true },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Performance</h1>
        <p className="text-sm text-slate-500">Your exam scores and progress overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {recentScores.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Recent Exam Scores</h2>
            <div className="space-y-3">
              {recentScores.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{s.exam}</p>
                    <p className="text-xs text-slate-500">{s.subject}{s.date ? ` · ${s.date}` : ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800">{s.score}/{s.total}</p>
                    <p className={`text-xs font-medium ${s.pct >= 80 ? "text-emerald-600" : s.pct >= 60 ? "text-amber-600" : "text-red-600"}`}>
                      {s.pct}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {graded.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center py-16">
            <Target className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">No exam results yet</p>
            <p className="text-xs text-slate-400 mt-1">Complete an exam to see your performance</p>
          </div>
        )}
      </div>
    </div>
  );
}
