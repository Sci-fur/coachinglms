import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import {
  Loader2, Plus, Pencil, Trash2, Video, ExternalLink,
  Calendar, Clock, User, X, Filter, Search,
} from "lucide-react";

const defaultForm = {
  title: "", description: "", teacher: "", subject: "",
  date: "", startTime: "", endTime: "", meetingLink: "",
  recordingUrl: "", status: "scheduled", course: "",
};

export default function AdminLiveClasses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data: classes, isLoading } = useQuery({
    queryKey: ["admin-live-classes", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await client.get(`/live-classes/admin?${params}`);
      return data.data;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await client.get("/admin/courses");
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body) => client.post("/live-classes/admin", body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-live-classes"] }); setDrawerOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => client.patch(`/live-classes/admin/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-live-classes"] }); setDrawerOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/live-classes/admin/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-live-classes"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDrawerOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    setForm({
      title: c.title || "",
      description: c.description || "",
      teacher: c.teacher || "",
      subject: c.subject || "",
      date: c.date ? c.date.split("T")[0] : "",
      startTime: c.startTime || "",
      endTime: c.endTime || "",
      meetingLink: c.meetingLink || "",
      recordingUrl: c.recordingUrl || "",
      status: c.status || "scheduled",
      course: c.course?._id || "",
    });
    setDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (editing) updateMutation.mutate({ id: editing, body: payload });
    else createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const filtered = classes?.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status) => {
    switch (status) {
      case "scheduled": return "bg-blue-50 text-blue-700 border-blue-200";
      case "live": return "bg-green-50 text-green-700 border-green-200";
      case "completed": return "bg-slate-50 text-slate-600 border-slate-200";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-slate-800 shrink-0">Live Classes</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none">
          <option value="">All status</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer shrink-0">
          <Plus className="h-3.5 w-3.5" /> New Class
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : !filtered?.length ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200">
          <Video className="h-8 w-8 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-600">No live classes</p>
          <p className="text-sm text-slate-400 mt-1">Schedule your first live class</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Class</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Teacher</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Date & Time</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Link</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-800">{c.title}</p>
                    {c.course?.name && <p className="text-xs text-slate-500">{c.course.name}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{c.teacher || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{c.date ? new Date(c.date).toLocaleDateString("en-BD") : "—"}</span>
                    <br />
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3 w-3" />{c.startTime}{c.endTime ? ` - ${c.endTime}` : ""}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {c.meetingLink && (
                      <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#0D9488] hover:underline">
                        <ExternalLink className="h-3 w-3" /> Meeting
                      </a>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(c)} className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(c._id)} className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute top-0 bottom-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in">
            <div className="flex items-center justify-between px-6 h-14 border-b border-slate-200 shrink-0">
              <h2 className="text-sm font-bold text-slate-800">{editing ? "Edit Live Class" : "New Live Class"}</h2>
              <button onClick={() => setDrawerOpen(false)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Quadratic Equations — Live Solving" className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Teacher</label>
                  <input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} placeholder="Mr. Rahman" className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Subject</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Mathematics" className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Course *</label>
                  <select required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none">
                    <option value="">Select course</option>
                    {courses?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none">
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Start time</label>
                  <input value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} placeholder="3:00 PM" className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">End time</label>
                  <input value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} placeholder="4:30 PM" className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Meeting link</label>
                <input value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Recording URL <span className="text-xs text-slate-400">(set after class ends)</span></label>
                <input value={form.recordingUrl} onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary" />
              </div>
            </form>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
              <button type="button" onClick={() => setDrawerOpen(false)} className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={isPending} className="h-9 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg cursor-pointer disabled:opacity-50">
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
