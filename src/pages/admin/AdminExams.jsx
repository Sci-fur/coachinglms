import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { useToast } from "../../components/Toast";
import {
  Loader2, Plus, FileCheck, Search, Clock, FileText,
  Pencil, Trash2, X, ChevronDown, Users,
  CheckCircle, AlertCircle,
} from "lucide-react";

export default function AdminExams() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", course: "", duration: "", totalMarks: "", passingMarks: "", instructions: "" });
  const [questionDrawer, setQuestionDrawer] = useState(null);
  const [qForm, setQForm] = useState({ type: "mcq", questionText: "", marks: "", options: [{ label: "A", text: "" }, { label: "B", text: "" }], correctAnswer: "", referenceAnswer: "" });
  const [expandedExam, setExpandedExam] = useState(null);
  const [expandedTab, setExpandedTab] = useState("questions");
  const [gradeDrawer, setGradeDrawer] = useState(null);
  const [gradeMarks, setGradeMarks] = useState({});
  const [editingQId, setEditingQId] = useState(null);
  const [editQForm, setEditQForm] = useState({});

  const { data: courses } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data } = await client.get("/admin/courses");
      return data.data;
    },
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ["admin-exams"],
    queryFn: async () => {
      const { data } = await client.get("/admin/exams");
      return data.data;
    },
  });

  const { data: questions } = useQuery({
    queryKey: ["admin-questions", expandedExam],
    queryFn: async () => {
      if (!expandedExam) return [];
      const { data } = await client.get(`/admin/exams/${expandedExam}/questions`);
      return data.data;
    },
    enabled: !!expandedExam,
  });

  const { data: submissions } = useQuery({
    queryKey: ["admin-submissions", expandedExam],
    queryFn: async () => {
      if (!expandedExam) return [];
      const { data } = await client.get(`/admin/exams/${expandedExam}/submissions`);
      return data.data;
    },
    enabled: !!expandedExam,
  });

  const createMutation = useMutation({
    mutationFn: () => client.post("/admin/exams", { ...form, duration: Number(form.duration), totalMarks: Number(form.totalMarks), passingMarks: Number(form.passingMarks) || 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-exams"] }); setDrawer(null); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => client.put(`/admin/exams/${drawer._id}`, { ...form, duration: Number(form.duration), totalMarks: Number(form.totalMarks), passingMarks: Number(form.passingMarks) || 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-exams"] }); setDrawer(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/exams/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-exams"] }),
  });

  const createQMutation = useMutation({
    mutationFn: () => client.post(`/admin/exams/${expandedExam}/questions`, {
      ...qForm,
      marks: Number(qForm.marks),
      options: qForm.type === "mcq" ? qForm.options.filter((o) => o.text.trim()) : [],
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-questions", expandedExam] }); setQuestionDrawer(null); resetQForm(); },
  });

  const deleteQMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/exams/${expandedExam}/questions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-questions", expandedExam] }),
  });

  const updateQMutation = useMutation({
    mutationFn: ({ id, ...payload }) => client.put(`/admin/exams/${expandedExam}/questions/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions", expandedExam] });
      setEditingQId(null);
    },
    onError: (err) => toast(err.response?.data?.message || "Update failed", "error"),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ submissionId, answers }) => client.post(`/admin/submissions/${submissionId}/grade`, { answers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions", expandedExam] });
      setGradeDrawer(null);
      setGradeMarks({});
    },
  });

  function resetForm() { setForm({ title: "", description: "", course: "", duration: "", totalMarks: "", passingMarks: "", instructions: "" }); }
  function resetQForm() { setQForm({ type: "mcq", questionText: "", marks: "", options: [{ label: "A", text: "" }, { label: "B", text: "" }], correctAnswer: "", referenceAnswer: "" }); }

  function openEdit(exam) {
    setForm({
      title: exam.title,
      description: exam.description || "",
      course: exam.course?._id || exam.course || "",
      duration: String(exam.duration),
      totalMarks: String(exam.totalMarks),
      passingMarks: String(exam.passingMarks || 0),
      instructions: exam.instructions || "",
      status: exam.status,
    });
    setDrawer(exam);
  }

  function openGrade(submission) {
    const marks = {};
    for (const a of submission.answers || []) {
      if (a.marksObtained !== null) marks[a.question] = a.marksObtained;
    }
    setGradeMarks(marks);
    setGradeDrawer(submission);
  }

  const statusBadge = (s) => {
    if (s === "published") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "completed") return "bg-slate-100 text-slate-600 border-slate-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const filtered = exams?.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Exams</h1>
        <button onClick={() => { resetForm(); setDrawer({}); }} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer">
          <Plus className="h-3.5 w-3.5" /> New Exam
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm outline-none" placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !filtered?.length ? (
        <div className="flex flex-col items-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3"><FileCheck className="h-6 w-6 text-slate-400" /></div>
          <p className="font-semibold text-slate-600">No exams yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exam) => (
            <div key={exam._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{exam.title}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(exam.status)}`}>{exam.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{exam.course?.name || "—"}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mr-4">
                  <span>{exam.totalMarks} marks</span>
                  <span>{exam.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setExpandedExam(expandedExam === exam._id ? null : exam._id)} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer">
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expandedExam === exam._id ? "rotate-180" : ""}`} />
                  </button>
                  <button onClick={() => openEdit(exam)} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Pencil className="h-4 w-4 text-slate-400" /></button>
                  <button onClick={() => { if (confirm("Delete this exam?")) deleteMutation.mutate(exam._id); }} className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer"><Trash2 className="h-4 w-4 text-red-400" /></button>
                </div>
              </div>

              {expandedExam === exam._id && (
                <div className="border-t border-slate-100">
                  <div className="flex items-center justify-between px-5 pt-3 pb-2">
                    <div className="flex gap-1">
                      <button onClick={() => setExpandedTab("questions")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${expandedTab === "questions" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                        Questions ({questions?.length || 0})
                      </button>
                      <button onClick={() => setExpandedTab("submissions")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${expandedTab === "submissions" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                        Submissions ({submissions?.length || 0})
                      </button>
                    </div>
                    <button onClick={() => { resetQForm(); setQuestionDrawer({}); }} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium text-[#0D9488] border border-[#0D9488]/30 hover:bg-[#0D9488]/5 transition-all cursor-pointer">
                      <Plus className="h-3 w-3" /> Add Question
                    </button>
                  </div>

                  {expandedTab === "questions" && (
                    <div className="px-5 py-3 bg-slate-50/50">
                      {questions?.length > 0 && questions[0]?.exam === exam._id && (() => {
                        const sumMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);
                        if (sumMarks !== exam.totalMarks) {
                          return (
                            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              <span className="text-[11px] font-medium text-amber-700">
                                Question marks ({sumMarks}) don't match exam total ({exam.totalMarks})
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {!questions?.length ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No questions yet</p>
                      ) : (
                        <div className="space-y-2">
                          {questions.map((q, i) => (
                            editingQId === q._id ? (
                              <div key={q._id} className="bg-white rounded-lg border border-slate-200 px-4 py-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Editing question {i + 1}</span>
                                  <button onClick={() => setEditingQId(null)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Cancel</button>
                                </div>
                                <input value={editQForm.questionText} onChange={(e) => setEditQForm({ ...editQForm, questionText: e.target.value })} className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs outline-none" placeholder="Question text" />
                                <div className="flex gap-2">
                                  <select value={editQForm.type} onChange={(e) => setEditQForm({ ...editQForm, type: e.target.value })} className="h-8 px-2 rounded-lg border border-slate-200 text-xs outline-none">
                                    <option value="mcq">MCQ</option>
                                    <option value="written">Written</option>
                                  </select>
                                  <input value={editQForm.marks} onChange={(e) => setEditQForm({ ...editQForm, marks: e.target.value })} className="w-16 h-8 px-2 rounded-lg border border-slate-200 text-xs outline-none" placeholder="Marks" />
                                </div>
                                {editQForm.type === "mcq" && (
                                  <div className="space-y-1.5">
                                    {editQForm.options?.map((o, oi) => (
                                      <div key={oi} className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 w-4">{o.label}.</span>
                                        <input value={o.text} onChange={(e) => {
                                          const opts = [...editQForm.options];
                                          opts[oi] = { ...opts[oi], text: e.target.value };
                                          setEditQForm({ ...editQForm, options: opts });
                                        }} className="flex-1 h-7 px-2 rounded-lg border border-slate-200 text-xs outline-none" />
                                      </div>
                                    ))}
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-400 w-4">✓</span>
                                      <input value={editQForm.correctAnswer} onChange={(e) => setEditQForm({ ...editQForm, correctAnswer: e.target.value })} className="flex-1 h-7 px-2 rounded-lg border border-slate-200 text-xs outline-none" placeholder="Correct answer label (e.g. A)" />
                                    </div>
                                  </div>
                                )}
                                {editQForm.type === "written" && (
                                  <div className="space-y-1.5">
                                    <input value={editQForm.correctAnswer} onChange={(e) => setEditQForm({ ...editQForm, correctAnswer: e.target.value })} className="w-full h-7 px-2 rounded-lg border border-slate-200 text-xs outline-none" placeholder="Correct answer" />
                                    <textarea value={editQForm.referenceAnswer} onChange={(e) => setEditQForm({ ...editQForm, referenceAnswer: e.target.value })} className="w-full h-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs outline-none resize-none" placeholder="Reference answer (optional)" />
                                  </div>
                                )}
                                <div className="flex justify-end">
                                  <button onClick={() => {
                                    const payload = { ...editQForm, marks: Number(editQForm.marks), options: editQForm.type === "mcq" ? editQForm.options.filter((o) => o.text.trim()) : [] };
                                    updateQMutation.mutate({ id: q._id, ...payload });
                                  }} disabled={updateQMutation.isPending} className="h-7 px-3 rounded-lg text-[11px] font-bold text-white bg-[#0D9488] hover:shadow transition-all cursor-pointer disabled:opacity-50">
                                    {updateQMutation.isPending ? "Saving..." : "Save"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div key={q._id} className="flex items-start justify-between gap-3 bg-white rounded-lg border border-slate-200 px-4 py-2.5">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-800">
                                    <span className="text-slate-400 mr-1">{i + 1}.</span>
                                    {q.questionText}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${q.type === "mcq" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>{q.type}</span>
                                    <span className="text-[10px] text-slate-400">{q.marks} marks</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button onClick={() => {
                                    setEditingQId(q._id);
                                    setEditQForm({
                                      type: q.type || "mcq",
                                      questionText: q.questionText || "",
                                      marks: String(q.marks || ""),
                                      options: q.options?.length ? q.options.map((o) => ({ label: o.label, text: o.text })) : [],
                                      correctAnswer: q.correctAnswer || "",
                                      referenceAnswer: q.referenceAnswer || "",
                                    });
                                  }} className="h-7 w-7 rounded-lg hover:bg-blue-50 flex items-center justify-center cursor-pointer"><Pencil className="h-3.5 w-3.5 text-slate-400" /></button>
                                  <button onClick={() => { if (confirm("Delete this question?")) deleteQMutation.mutate(q._id); }} className="h-7 w-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {expandedTab === "submissions" && (
                    <div className="px-5 py-3 bg-slate-50/50">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Student Submissions</h4>
                      {!submissions?.length ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No submissions yet</p>
                      ) : (
                        <div className="space-y-2">
                          {submissions.map((s) => {
                            const subStatus = s.status === "graded" ? "Graded" : s.status === "submitted" ? "Awaiting" : "In Progress";
                            const subColor = s.status === "graded" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50";
                            return (
                              <div key={s._id} className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-2.5">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-800">{s.user?.name || s.user?.email || "Unknown"}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${subColor}`}>{subStatus}</span>
                                    {s.status === "graded" && (
                                      <span className="text-[10px] text-slate-500">{s.totalMarksObtained} marks</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => openGrade(s)}
                                  className="h-7 px-2.5 rounded-lg text-[11px] font-bold text-white bg-[#0D9488] hover:shadow transition-all cursor-pointer"
                                >
                                  {s.status === "graded" ? "View" : "Grade"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Exam drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => { setDrawer(null); resetForm(); }}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-800">{drawer._id ? "Edit Exam" : "New Exam"}</h2>
              <button onClick={() => { setDrawer(null); resetForm(); }} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none mt-1 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Course *</label>
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none mt-1">
                  <option value="">Select course</option>
                  {courses?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Duration (min) *</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Total Marks *</label>
                  <input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Passing Marks</label>
                  <input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Status</label>
                  <select value={form.status || "draft"} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none mt-1">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Instructions</label>
                <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none mt-1 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-200">
              <button onClick={() => { setDrawer(null); resetForm(); }} className="h-9 px-4 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button
                onClick={() => drawer._id ? updateMutation.mutate() : createMutation.mutate()}
                disabled={!form.title || !form.course || !form.duration || !form.totalMarks || createMutation.isPending || updateMutation.isPending}
                className="h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : drawer._id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question drawer */}
      {questionDrawer && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => { setQuestionDrawer(null); resetQForm(); }}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-800">Add Question</h2>
              <button onClick={() => { setQuestionDrawer(null); resetQForm(); }} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700">Type *</label>
                <select value={qForm.type} onChange={(e) => setQForm({ ...qForm, type: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none mt-1">
                  <option value="mcq">MCQ</option>
                  <option value="written">Written</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Question *</label>
                <textarea value={qForm.questionText} onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })} className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none mt-1 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Marks *</label>
                <input type="number" value={qForm.marks} onChange={(e) => setQForm({ ...qForm, marks: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none mt-1" />
              </div>
              {qForm.type === "mcq" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Options</label>
                    {qForm.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 w-5">{opt.label}</span>
                        <input value={opt.text} onChange={(e) => {
                          const newOpts = [...qForm.options];
                          newOpts[i] = { ...newOpts[i], text: e.target.value };
                          setQForm({ ...qForm, options: newOpts });
                        }} className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none" />
                        {i === qForm.options.length - 1 && (
                          <button onClick={() => {
                            const nextLabel = String.fromCharCode(65 + qForm.options.length);
                            setQForm({ ...qForm, options: [...qForm.options, { label: nextLabel, text: "" }] });
                          }} className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer text-xs text-slate-400">+</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Correct Answer *</label>
                    <select value={qForm.correctAnswer} onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none mt-1">
                      <option value="">Select correct answer</option>
                      {qForm.options.filter((o) => o.text.trim()).map((opt) => (
                        <option key={opt.label} value={opt.label}>{opt.label}. {opt.text}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-medium text-slate-700">Reference Answer (for self-evaluation)</label>
                  <textarea value={qForm.referenceAnswer} onChange={(e) => setQForm({ ...qForm, referenceAnswer: e.target.value })} className="w-full h-24 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none mt-1 resize-none" placeholder="Provide a model answer that students can compare their response against..." />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-200">
              <button onClick={() => { setQuestionDrawer(null); resetQForm(); }} className="h-9 px-4 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button
                onClick={() => createQMutation.mutate()}
                disabled={!qForm.questionText || !qForm.marks || (qForm.type === "mcq" && !qForm.correctAnswer) || createQMutation.isPending}
                className="h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {createQMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade drawer */}
      {gradeDrawer && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => { setGradeDrawer(null); setGradeMarks({}); }}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-800">
                {gradeDrawer.user?.name || gradeDrawer.user?.email || "Student"} — Submission
              </h2>
              <button onClick={() => { setGradeDrawer(null); setGradeMarks({}); }} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {gradeDrawer.status === "graded" && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Graded — {gradeDrawer.totalMarksObtained} marks
                </div>
              )}
              {gradeDrawer.answers?.length === 0 && (
                <p className="text-xs text-slate-400 py-8 text-center">No answers submitted</p>
              )}
              {gradeDrawer.answers?.map((a, i) => {
                const q = questions?.find((qq) => qq._id === a.question);
                return (
                  <div key={a.question || i} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-slate-800">
                        <span className="text-slate-400 mr-1">{i + 1}.</span>
                        {q?.questionText || "Question"}
                      </p>
                      <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${q?.type === "mcq" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                        {q?.type || "?"} · {q?.marks || "?"} marks
                      </span>
                    </div>

                    {q?.type === "mcq" ? (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Selected: <span className="font-medium text-slate-700">{a.selectedOption || "—"}</span></p>
                        <p className="text-xs text-slate-500">Correct: <span className="font-medium text-emerald-600">{q?.correctAnswer || "—"}</span></p>
                        <p className="text-xs mt-1">
                          {a.marksObtained !== null ? (
                            <span className="text-emerald-600 font-medium">+{a.marksObtained} marks (auto-graded)</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Not graded</span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Student's answer:
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${a.marksObtained !== null ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                            {a.marksObtained !== null ? "Graded" : "Ungraded"}
                          </span>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-3 mb-3">
                          <p className="text-xs text-slate-700 whitespace-pre-wrap">{a.textAnswer || "(no answer)"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-slate-500">Marks:</label>
                          <input
                            type="number"
                            value={gradeMarks[a.question] ?? ""}
                            onChange={(e) => {
                              const max = q?.marks || 0;
                              let value = e.target.value === "" ? "" : Number(e.target.value);
                              if (typeof value === "number" && !isNaN(value)) {
                                value = Math.max(0, Math.min(value, max));
                              }
                              setGradeMarks({ ...gradeMarks, [a.question]: value });
                            }}
                            className="w-20 h-8 px-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                            max={q?.marks || 0}
                            min={0}
                          />
                          <span className="text-xs text-slate-400">/ {q?.marks || 0}</span>
                          {gradeMarks[a.question] !== "" && (gradeMarks[a.question] ?? 0) > (q?.marks || 0) && (
                            <span className="text-[10px] text-red-500 font-medium">Exceeds max!</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-200">
              <button onClick={() => { setGradeDrawer(null); setGradeMarks({}); }} className="h-9 px-4 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer">Close</button>
              {(() => {
                const dirtyEntries = Object.entries(gradeMarks).filter(([_, m]) => m !== "");
                const hasOver = dirtyEntries.some(([id, m]) => {
                  const q = questions?.find((qq) => qq._id === id);
                  return m > (q?.marks || 0);
                });
                return (
                  <button
                    onClick={() => {
                      if (hasOver) { toast("Some marks exceed the maximum. Please correct them before saving.", "error"); return; }
                      const answers = dirtyEntries.map(([questionId, marksObtained]) => ({ questionId, marksObtained }));
                      gradeMutation.mutate({ submissionId: gradeDrawer._id, answers });
                    }}
                    disabled={gradeMutation.isPending || dirtyEntries.length === 0}
                    className="h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {gradeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `Save Grades${dirtyEntries.length > 0 ? ` (${dirtyEntries.length})` : ""}`}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
