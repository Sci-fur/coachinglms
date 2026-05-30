import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Loader2, Search, Plus, BookOpen, Pencil, Trash2, X } from "lucide-react";

const groupLabels = {
  "n/a": "General",
  science: "Science",
  business: "Business Studies",
  arts: "Arts",
};

const defaultForm = { name: "", classLevel: "6", academicGroup: "n/a" };

export default function AdminSubjects() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!drawerOpen) {
      setTimeout(() => {
        setEditId(null);
        setForm(defaultForm);
        setFormError("");
      }, 200);
    }
  }, [drawerOpen]);

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects", classFilter],
    queryFn: async () => {
      const params = {};
      if (classFilter !== "all") params.classLevel = classFilter;
      const { data } = await client.get("/admin/subjects", { params });
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => client.post("/admin/subjects", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setDrawerOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.message || "Failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) => client.put(`/admin/subjects/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setDrawerOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.message || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setDeleteConfirm(null);
    },
    onError: (err) => setFormError(err.response?.data?.message || "Failed to delete"),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(defaultForm);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (subject) => {
    setEditId(subject._id);
    setForm({
      name: subject.name,
      classLevel: subject.classLevel.toString(),
      academicGroup: subject.academicGroup,
    });
    setFormError("");
    setDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    const payload = { ...form, classLevel: Number(form.classLevel) };
    if (editId) updateMutation.mutate({ id: editId, ...payload });
    else createMutation.mutate(payload);
  };

  const filtered = subjects?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-slate-800 shrink-0">Subjects</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-200 h-9"
            placeholder="Search subjects..."
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
        <Button onClick={openCreate} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          New Subject
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <BookOpen className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">No subjects found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? "Try a different search term" : "Create your first subject"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Subject Name</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Class</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Group</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered?.map((subject) => (
                <tr key={subject._id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-slate-800">{subject.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-600">Class {subject.classLevel}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-600 capitalize">
                      {groupLabels[subject.academicGroup] || subject.academicGroup}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        subject.isActive
                          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${subject.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {subject.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(subject)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(subject._id)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
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

      {/* Slide-over drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-slate-200 shrink-0">
              <h2 className="text-base font-bold text-slate-800">
                {editId ? "Edit subject" : "New subject"}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Subject name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Physics"
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
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 shrink-0">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="min-w-[100px]"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </span>
                ) : editId ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-xl shadow-xl px-5 py-3 flex items-center gap-4 text-sm">
          <span>Delete this subject?</span>
          <div className="flex gap-2">
            <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-colors cursor-pointer">Cancel</button>
            <button onClick={() => deleteMutation.mutate(deleteConfirm)} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors cursor-pointer">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
