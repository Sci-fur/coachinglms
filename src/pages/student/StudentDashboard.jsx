import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import client from "../../api/client";
import { useToast } from "../../components/Toast";
import { MapPin, Clock, Users, GraduationCap, BookOpen, Loader2, Sparkles, TrendingUp, Check, Camera } from "lucide-react";

const classLevels = [6, 7, 8, 9, 10, 11, 12];

const categories = [
  { value: "", label: "All Course" },
  { value: "college-admission", label: "College Admission" },
  { value: "ssc-model-test", label: "SSC Model Test" },
  { value: "academic-revision", label: "Academic & Revision" },
  { value: "foundation", label: "Foundation" },
];

const typeStyles = {
  "college-admission": {
    gradient: "from-violet-600 to-purple-700",
    badge: "bg-violet-500/10 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  "ssc-model-test": {
    gradient: "from-emerald-600 to-teal-700",
    badge: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  "academic-revision": {
    gradient: "from-orange-600 to-amber-600",
    badge: "bg-amber-500/10 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  "foundation": {
    gradient: "from-blue-600 to-indigo-700",
    badge: "bg-blue-500/10 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [classFilter, setClassFilter] = useState("10");
  const [categoryFilter, setCategoryFilter] = useState("");

  const photoUploadMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("photo", file);
      return client.post("/uploads/profile-photo", fd);
    },
    onSuccess: ({ data }) => {
      setUser({ ...user, profilePhoto: data.data.profilePhoto });
      toast("Profile photo updated", "success");
    },
    onError: (err) => {
      toast(err.response?.data?.message || "Upload failed", "error");
    },
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) photoUploadMutation.mutate(file);
  };

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

  if (!user) return null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-6">
      {/* Compact greeting banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D9488] via-[#059669] to-[#047857] p-4 sm:p-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#FDBA74]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center overflow-hidden ring-2 ring-white/20">
                {user?.profilePhoto?.url ? (
                  <img src={user.profilePhoto.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Sparkles className="h-4 w-4 text-teal-100" />
                )}
              </div>
              <button
                type="button"
                disabled={photoUploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
                title="Upload photo"
              >
                {photoUploadMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin text-slate-600" />
                ) : (
                  <Camera className="h-3 w-3 text-slate-600" />
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {greeting}, {user.name.split(" ")[0]}!
              </h1>
              <p className="text-xs text-teal-100/70">Ready to keep learning?</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-100/70">Next Class</p>
              <p className="text-xs font-bold text-white">Today, 3:00 PM</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-100/70">Courses</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-teal-200" />
                <p className="text-xs font-bold text-white">{courses?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{courses?.length || 0}</span> programs for{" "}
          <span className="font-semibold text-slate-700">Class {getClassLabel(Number(classFilter))}</span>
        </p>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-[#E8ECF0] rounded-xl px-3.5 py-2 shadow-sm">
            <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none py-0.5 text-slate-700"
            >
              {classLevels.map((c) => (
                <option key={c} value={c}>
                  Class {getClassLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-[#E8ECF0] rounded-xl px-3.5 py-2 shadow-sm">
            <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none py-0.5 text-slate-700"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500">Loading programs...</p>
          </div>
        </div>
      ) : !courses?.length ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#E8ECF0]">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <GraduationCap className="h-7 w-7 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">No programs available</p>
          <p className="text-sm text-slate-400 mt-1">Try a different class or category</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((program) => {
            const style = typeStyles[program.type] || typeStyles["academic-revision"];
            return (
              <div
                key={program._id}
                className="group bg-white rounded-2xl border border-[#E8ECF0] flex flex-col overflow-hidden card-lift"
              >
                {/* Top accent bar */}
                <div className="h-1.5 shrink-0 bg-gradient-to-r relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${style.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </div>

                {/* Header */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="text-sm font-bold leading-snug text-slate-800">{program.title}</h3>
                      {program.subtitle && (
                        <p className="text-xs text-slate-500 leading-relaxed">{program.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {typeLabels[program.type]}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      program.mode === "online"
                        ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200"
                        : program.mode === "offline"
                          ? "bg-violet-500/10 text-violet-700 border border-violet-200"
                          : "bg-blue-500/10 text-blue-700 border border-blue-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        program.mode === "online" ? "bg-emerald-500" : program.mode === "offline" ? "bg-violet-500" : "bg-blue-500"
                      }`} />
                      {program.mode === "online" ? "Online" : program.mode === "offline" ? "Offline" : "Both"}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 pb-2 space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{program.scheduleText}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{program.enrolled} enrolled</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-[#E8ECF0] mt-auto">
                  <div>
                    <span className="text-lg font-bold text-slate-800">৳{program.fee?.toLocaleString()}</span>
                    <span className="text-[11px] text-slate-400 ml-1">/total</span>
                  </div>
                  {program.isEnrolled ? (
                    <span className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <Check className="h-3.5 w-3.5" />
                      Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate(`/dashboard/checkout/${program._id}`)}
                      className="relative inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      Enroll Now
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
