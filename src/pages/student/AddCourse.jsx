import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2, Search, GraduationCap, BookOpen, MapPin, Clock, Users, Check } from "lucide-react";

const classLevels = [6, 7, 8, 9, 10, 11, 12];
const categories = [
  { value: "", label: "All Course" },
  { value: "college-admission", label: "College Admission" },
  { value: "ssc-model-test", label: "SSC Model Test" },
  { value: "academic-revision", label: "Academic & Revision" },
  { value: "foundation", label: "Foundation" },
];

const typeStyles = {
  "college-admission": { gradient: "from-violet-600 to-purple-700" },
  "ssc-model-test": { gradient: "from-emerald-600 to-teal-700" },
  "academic-revision": { gradient: "from-orange-600 to-amber-600" },
  "foundation": { gradient: "from-blue-600 to-indigo-700" },
};

const typeLabels = {
  "college-admission": "College Admission",
  "ssc-model-test": "SSC Model Test",
  "academic-revision": "Academic & Revision",
  "foundation": "Foundation",
};

function getClassLabel(c) {
  if (c === 10) return "Ten";
  if (c === 11) return "Eleven";
  if (c === 12) return "Twelve";
  return String(c);
}

export default function AddCourse() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("10");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["student-courses", classFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (classFilter) params.set("classLevel", classFilter);
      if (categoryFilter) params.set("type", categoryFilter);
      const { data } = await client.get(`/student/courses?${params}`);
      return data.data;
    },
  });

  const filtered = courses?.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Add Course</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-200 h-9"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none"
        >
          {classLevels.map((c) => (
            <option key={c} value={c}>Class {getClassLabel(c)}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <GraduationCap className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">No programs found</p>
          <p className="text-sm text-slate-400 mt-1">Try different filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered?.map((program) => {
            const style = typeStyles[program.type] || typeStyles["academic-revision"];
            return (
              <div key={program._id} className="group bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden card-lift">
                <div className={`h-1.5 shrink-0 bg-gradient-to-r ${style.gradient}`} />

                <div className="px-4 pt-4 pb-2 flex-1">
                  <h3 className="text-sm font-bold text-slate-800 leading-snug">{program.title}</h3>
                  {program.subtitle && (
                    <p className="text-xs text-slate-500 mt-1">{program.subtitle}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {typeLabels[program.type]}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    {program.scheduleText && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{program.scheduleText}</span>
                      </div>
                    )}
                    {program.duration && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{program.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{program.enrolled} enrolled</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 mt-auto">
                  <span className="text-base font-bold text-slate-800">৳{program.fee?.toLocaleString()}</span>
                  {program.isEnrolled ? (
                    <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <Check className="h-3.5 w-3.5" />
                      Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate(`/dashboard/checkout/${program._id}`)}
                      className="h-8 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
