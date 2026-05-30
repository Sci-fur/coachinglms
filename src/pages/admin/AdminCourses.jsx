import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { useToast } from "../../components/Toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Loader2, Search, Plus, GraduationCap, Clock, Users, Pencil, Trash2, X, MapPin, BookOpen, Camera } from "lucide-react";

const typeColors = {
  "college-admission": "from-violet-600 to-purple-700",
  "ssc-model-test": "from-emerald-600 to-teal-700",
  "academic-revision": "from-orange-600 to-amber-700",
  "foundation": "from-blue-600 to-indigo-700",
};

const typeLabels = {
  "college-admission": "College Admission",
  "ssc-model-test": "SSC Model Test",
  "academic-revision": "Academic & Revision",
  "foundation": "Foundation",
};

const modeLabels = {
  online: "Online",
  offline: "Offline",
  both: "Both",
};

const defaultForm = {
  name: "",
  subtitle: "",
  description: "",
  type: "academic-revision",
  mode: "online",
  scheduleText: "",
  duration: "",
  fee: "",
  subject: "",
  batch: "",
  status: "draft",
};

export default function AdminCourses() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const thumbInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!drawerOpen) {
      setTimeout(() => {
        setEditing(null);
        setForm(defaultForm);
        setFormError("");
      }, 200);
    }
  }, [drawerOpen]);

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await client.get("/admin/courses");
      return data.data;
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects", "all"],
    queryFn: async () => {
      const { data } = await client.get("/admin/subjects");
      return data.data;
    },
  });

  const { data: batches } = useQuery({
    queryKey: ["batches", "all"],
    queryFn: async () => {
      const { data } = await client.get("/admin/batches");
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => client.post("/admin/courses", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDrawerOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.message || "Failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => client.put(`/admin/courses/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDrawerOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.message || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDeleteConfirm(null);
    },
  });

  const thumbnailMutation = useMutation({
    mutationFn: ({ courseId, file }) => {
      const fd = new FormData();
      fd.append("thumbnail", file);
      return client.post(`/uploads/courses/${courseId}/thumbnail`, fd);
    },
    onSuccess: ({ data }) => {
      setCourseThumbnail(data.data.thumbnail);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast("Thumbnail updated", "success");
    },
    onError: (err) => {
      toast(err.response?.data?.message || "Upload failed", "error");
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setCourseThumbnail("");
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (course) => {
    setEditing(course._id);
    setCourseThumbnail(course.thumbnail || "");
    setForm({
      name: course.name || "",
      subtitle: course.subtitle || "",
      description: course.description || "",
      type: course.type || "academic-revision",
      mode: course.mode || "online",
      scheduleText: course.scheduleText || "",
      duration: course.duration || "",
      fee: course.fee ?? "",
      subject: course.subject?._id || "",
      batch: course.batch?._id || "",
      status: course.status || "draft",
    });
    setFormError("");
    setDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    const payload = { ...form, fee: form.fee === "" ? 0 : Number(form.fee) };
    if (editing) {
      updateMutation.mutate({ id: editing, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filtered = courses?.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-slate-800 shrink-0">Course Offerings</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-200 h-9"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={openCreate} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          New Course
        </Button>
      </div>

      {/* Course grid */}
      {coursesLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <GraduationCap className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">No courses found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? "Try a different search term" : "Create your first course"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered?.map((course) => {
            const enrolled = course.batch?.students?.length || 0;
            const gradient = typeColors[course.type] || "from-gray-600 to-gray-700";
            return (
              <div key={course._id} className="group bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden card-lift">
                <div className={`h-1.5 shrink-0 bg-gradient-to-r ${gradient}`} />

                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-800 leading-snug">{course.name}</h3>
                      {course.subtitle && (
                        <p className="text-xs text-slate-500">{course.subtitle}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link
                        to={`/admin/courses/${course._id}/content`}
                        className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                        title="Manage Content"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => openEdit(course)}
                        className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(course._id)}
                        className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge variant="outline" className="text-[10px] font-medium border-slate-200 text-slate-600">
                      {typeLabels[course.type]}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-medium border-slate-200 text-slate-600">
                      {modeLabels[course.mode]}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-medium border-slate-200 text-slate-600">
                      Class {course.batch?.classLevel}
                    </Badge>
                    <Badge
                      variant={course.status === "published" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {course.status}
                    </Badge>
                  </div>
                </div>

                <div className="px-4 pb-2 space-y-1.5 text-xs text-slate-500 flex-1">
                  {course.scheduleText && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{course.scheduleText}</span>
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{enrolled} enrolled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 mt-auto">
                  <div>
                    <span className="text-base font-bold text-slate-800">৳{course.fee?.toLocaleString() || "0"}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {course.subject?.name || "—"} · {course.batch?.name || "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm toast */}
      {deleteConfirm && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-xl shadow-xl px-5 py-3 flex items-center gap-4 text-sm">
          <span>Delete this course?</span>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate(deleteConfirm)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Slide-over drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute top-0 bottom-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-slate-200 shrink-0">
              <h2 className="text-base font-bold text-slate-800">
                {editing ? "Edit course" : "New course"}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic info */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Course name *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. College Admission Program 2026"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Subtitle</label>
                      <input
                        value={form.subtitle}
                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                        placeholder="e.g. Notre Dame, Holy Cross & Others"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Optional description"
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Program details */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Program Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Type</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      >
                        {Object.entries(typeLabels).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Mode</label>
                      <select
                        value={form.mode}
                        onChange={(e) => setForm({ ...form, mode: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      >
                        {Object.entries(modeLabels).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Duration</label>
                      <input
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        placeholder="e.g. 6 months"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Fee</label>
                      <div className="flex items-center h-9 rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
                        <span className="px-3 text-sm text-slate-500 bg-slate-50 h-full flex items-center border-r border-slate-200">৳</span>
                        <input
                          value={form.fee}
                          onChange={(e) => setForm({ ...form, fee: e.target.value })}
                          placeholder="12500"
                          className="flex-1 h-full px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Schedule</label>
                  <input
                    value={form.scheduleText}
                    onChange={(e) => setForm({ ...form, scheduleText: e.target.value })}
                    placeholder="e.g. Sat & Sun, 3:00 PM - 6:00 PM"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>

                {/* Thumbnail */}
                {editing && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Thumbnail</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-28 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        {courseThumbnail ? (
                          <img src={courseThumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <GraduationCap className="h-6 w-6 text-slate-300" />
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={thumbnailMutation.isPending}
                        onClick={() => thumbInputRef.current?.click()}
                        className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {thumbnailMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Camera className="h-3.5 w-3.5" />
                        )}
                        {courseThumbnail ? "Change" : "Upload"}
                      </button>
                      <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && editing) thumbnailMutation.mutate({ courseId: editing, file });
                      }} />
                    </div>
                  </div>
                )}

                {/* Assignment */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Assignment</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Subject *</label>
                      <select
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      >
                        <option value="">Select subject</option>
                        {subjects?.filter((s) => s.isActive).map((s) => (
                          <option key={s._id} value={s._id}>{s.name} (Class {s.classLevel})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Batch *</label>
                      <select
                        required
                        value={form.batch}
                        onChange={(e) => setForm({ ...form, batch: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      >
                        <option value="">Select batch</option>
                        {batches?.filter((b) => b.isActive).map((b) => (
                          <option key={b._id} value={b._id}>{b.name} (Class {b.classLevel})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Drawer footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 shrink-0">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </span>
                ) : editing ? (
                  "Update course"
                ) : (
                  "Create course"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
