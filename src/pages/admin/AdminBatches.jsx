import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2, Search, Plus, FolderKanban, Users, X, Clock } from "lucide-react";

const defaultForm = { name: "", classLevel: "6", academicGroup: "n/a", capacity: "" };

const groupLabels = {
  "n/a": "General",
  science: "Science",
  business: "Business Studies",
  arts: "Arts",
};

const groupGradients = {
  science: "from-emerald-600 to-teal-700",
  business: "from-blue-600 to-indigo-700",
  arts: "from-purple-600 to-violet-700",
  "n/a": "from-[#0D9488] to-[#0F766E]",
};

function to12h(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatSchedule(day, start, end) {
  return `${day}, ${to12h(start)} - ${to12h(end)}`;
}

export default function AdminBatches() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!drawerOpen) {
      setTimeout(() => {
        setForm(defaultForm);
        setFormError("");
      }, 200);
    }
  }, [drawerOpen]);

  const { data: batches, isLoading } = useQuery({
    queryKey: ["batches", classFilter],
    queryFn: async () => {
      const params = {};
      if (classFilter !== "all") params.classLevel = classFilter;
      const { data } = await client.get("/admin/batches", { params });
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => client.post("/admin/batches", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      setDrawerOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.message || "Failed to create"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => client.put(`/admin/batches/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["batches"] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    createMutation.mutate({
      ...form,
      classLevel: Number(form.classLevel),
      capacity: form.capacity === "" ? 0 : Number(form.capacity),
    });
  };

  const filtered = batches?.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = batches
    ? {
        total: batches.length,
        active: batches.filter((b) => b.isActive).length,
        enrolled: batches.reduce((sum, b) => sum + (b.students?.length || 0), 0),
      }
    : null;

  function getProgressInfo(used, capacity) {
    if (!capacity) return { percent: 0, color: "bg-slate-200", label: "Unlimited" };
    const pct = Math.min((used / capacity) * 100, 100);
    let color = "bg-primary";
    if (used === 0) color = "bg-slate-200";
    else if (pct >= 100) color = "bg-red-500";
    else if (pct >= 80) color = "bg-amber-500";
    return { percent: pct, color, label: `${used} / ${capacity}` };
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-slate-800 shrink-0">Batches</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-200 h-9"
            placeholder="Search batches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        >
          <option value="all">All classes</option>
          {[6, 7, 8, 9, 10, 11, 12].map((c) => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
        <Button onClick={() => setDrawerOpen(true)} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          New Batch
        </Button>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Total Batches:</span>
            <span className="font-semibold text-slate-800">{stats.total}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active:</span>
            <span className="font-semibold text-emerald-600">{stats.active}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">Enrolled:</span>
            <span className="font-semibold text-slate-800">{stats.enrolled}</span>
          </div>
        </div>
      )}

      {/* Batch list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <FolderKanban className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">No batches found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? "Try a different search term" : "Create your first batch"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered?.map((batch) => {
            const used = batch.students?.length || 0;
            const cap = batch.capacity || 0;
            const { percent, color, label } = getProgressInfo(used, cap);
            const gradient = groupGradients[batch.academicGroup] || groupGradients["n/a"];
            return (
              <div
                key={batch._id}
                className="group bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden card-lift"
              >
                {/* Top accent bar */}
                <div className={`h-1.5 shrink-0 bg-gradient-to-r ${gradient}`} />

                {/* Card header */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-800 leading-snug">
                        {batch.name}
                      </h3>
                      <p className="text-xs text-slate-500 capitalize">
                        Class {batch.classLevel} &middot; {groupLabels[batch.academicGroup] || batch.academicGroup}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        toggleMutation.mutate({ id: batch._id, isActive: !batch.isActive })
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                        batch.isActive ? "bg-primary" : "bg-slate-300"
                      }`}
                      title={batch.isActive ? "Deactivate" : "Activate"}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          batch.isActive ? "translate-x-[19px]" : "translate-x-[3px]"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-2 flex-1">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-slate-500">{label} students</span>
                    <span className="text-xs text-slate-400">
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Schedule preview */}
                {batch.schedule?.length > 0 && (
                  <div className="px-4 pb-3 border-t border-slate-100 pt-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {batch.schedule.slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md"
                        >
                          <Clock className="h-3 w-3 text-slate-400" />
                          {formatSchedule(s.day, s.startTime, s.endTime)}
                        </span>
                      ))}
                      {batch.schedule.length > 3 && (
                        <span className="text-[11px] text-slate-400">
                          +{batch.schedule.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in">
            <div className="flex items-center justify-between px-6 h-14 border-b border-slate-200 shrink-0">
              <h2 className="text-base font-bold text-slate-800">New batch</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Batch name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. SSC Science Morning"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Class</label>
                    <select
                      value={form.classLevel}
                      onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((c) => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Group</label>
                    <select
                      value={form.academicGroup}
                      onChange={(e) => setForm({ ...form, academicGroup: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    >
                      <option value="n/a">General</option>
                      <option value="science">Science</option>
                      <option value="business">Business Studies</option>
                      <option value="arts">Arts</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Capacity</label>
                  <div className="flex items-center h-9 rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
                    <span className="px-3 text-sm text-slate-500 bg-slate-50 h-full flex items-center border-r border-slate-200">
                      <Users className="h-3.5 w-3.5" />
                    </span>
                    <input
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      placeholder="Max students (leave empty for unlimited)"
                      className="flex-1 h-full px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 shrink-0">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="min-w-[100px]"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create batch"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
