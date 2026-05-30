import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Loader2, Search, Users, Plus, Pencil, Trash2, X } from "lucide-react";

const defaultForm = { name: "", email: "", phone: "", password: "", classLevel: "6", academicGroup: "n/a" };

const groupLabels = { "n/a": "General", science: "Science", business: "Business Studies", arts: "Arts" };

export default function AdminStudents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!drawerOpen) {
      setTimeout(() => {
        setEditId(null);
        setForm(defaultForm);
        setFormError("");
      }, 200);
    }
  }, [drawerOpen]);

  const { data: students, isLoading } = useQuery({
    queryKey: ["admin-students", search],
    queryFn: async () => {
      const params = {};
      if (search) params.search = search;
      const { data } = await client.get("/admin/students", { params });
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => client.post("/admin/students", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      setDrawerOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) => client.patch(`/admin/students/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      setDrawerOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.message || "Failed to update"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/students/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-students"] }),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(defaultForm);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (student) => {
    setEditId(student._id);
    setForm({
      name: student.name,
      email: student.email || "",
      phone: student.phone || "",
      password: "",
      classLevel: student.classLevel?.toString() || "6",
      academicGroup: student.academicGroup || "n/a",
    });
    setFormError("");
    setDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      classLevel: Number(form.classLevel),
      academicGroup: form.academicGroup,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate({ ...payload, password: form.password });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-slate-800 shrink-0">Students</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-9 bg-white border-slate-200 h-9" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openCreate} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Student
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : students?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">No students found</p>
          <p className="text-sm text-slate-400 mt-1">{search ? "Try a different search term" : "Add your first student"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Name</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Contact</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Class / Group</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students?.map((student) => (
                <tr key={student._id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-slate-800">{student.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-slate-600">{student.email || "—"}</div>
                    <div className="text-xs text-slate-400">{student.phone || "—"}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-600">
                      {student.classLevel ? `Class ${student.classLevel}` : "—"} {student.academicGroup && `· ${groupLabels[student.academicGroup] || student.academicGroup}`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      student.isActive
                        ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${student.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {student.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(student)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deactivateMutation.mutate(student._id)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Deactivate">
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
          <div className="absolute top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in">
            <div className="flex items-center justify-between px-6 h-14 border-b border-slate-200 shrink-0">
              <h2 className="text-base font-bold text-slate-800">{editId ? "Edit student" : "Add student"}</h2>
              <button onClick={() => setDrawerOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">{formError}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Full name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Email *</label>
                    <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Phone *</label>
                    <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{editId ? "Password (leave blank to keep)" : "Password *"}</label>
                  <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder={editId ? "Leave blank to keep current" : "Min 8 characters"} className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Class</label>
                    <select value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors">
                      {[6, 7, 8, 9, 10, 11, 12].map((c) => (<option key={c} value={c}>Class {c}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Group</label>
                    <select value={form.academicGroup} onChange={(e) => setForm({ ...form, academicGroup: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors">
                      <option value="n/a">General</option>
                      <option value="science">Science</option>
                      <option value="business">Business Studies</option>
                      <option value="arts">Arts</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 shrink-0">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleSubmit} disabled={isPending} className="min-w-[100px]">
                {isPending ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</span>
                ) : editId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
