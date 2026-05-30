import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import {
  Loader2, Plus, Pencil, Trash2, ChevronDown, Play, FileText,
  ArrowLeft, BookOpen, GripVertical, X, Film,
  ArrowUp, ArrowDown,
} from "lucide-react";

export default function AdminCourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [chapterForm, setChapterForm] = useState({ open: false, title: "", description: "", editing: null });
  const [lessonForm, setLessonForm] = useState({ open: false, chapterId: "", title: "", type: "video", videoUrl: "", articleBody: "", duration: "", editing: null });
  const [openChapter, setOpenChapter] = useState(null);

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data } = await client.get(`/admin/courses`);
      const c = data.data.find((c) => c._id === courseId);
      return c;
    },
  });

  const { data: chapters } = useQuery({
    queryKey: ["admin-chapters", courseId],
    queryFn: async () => {
      const { data } = await client.get(`/content/admin/courses/${courseId}/chapters`);
      return data.data;
    },
  });

  const createChapter = useMutation({
    mutationFn: (body) => client.post(`/content/admin/courses/${courseId}/chapters`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chapters", courseId] });
      setChapterForm({ open: false, title: "", description: "", editing: null });
    },
  });

  const updateChapter = useMutation({
    mutationFn: ({ id, body }) => client.patch(`/content/admin/chapters/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chapters", courseId] });
      setChapterForm({ open: false, title: "", description: "", editing: null });
    },
  });

  const deleteChapter = useMutation({
    mutationFn: (id) => client.delete(`/content/admin/chapters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chapters", courseId] });
      if (openChapter) setOpenChapter(null);
    },
  });

  const fetchLessons = (chapterId) =>
    useQuery({
      queryKey: ["admin-lessons", chapterId],
      queryFn: async () => {
        const { data } = await client.get(`/content/admin/chapters/${chapterId}/lessons`);
        return data.data;
      },
    });

  const createLesson = useMutation({
    mutationFn: ({ chapterId, body }) => client.post(`/content/admin/chapters/${chapterId}/lessons`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", lessonForm.chapterId] });
      setLessonForm({ open: false, chapterId: "", title: "", type: "video", videoUrl: "", articleBody: "", duration: "", editing: null });
    },
  });

  const updateLesson = useMutation({
    mutationFn: ({ id, body }) => client.patch(`/content/admin/lessons/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", lessonForm.chapterId] });
      setLessonForm({ open: false, chapterId: "", title: "", type: "video", videoUrl: "", articleBody: "", duration: "", editing: null });
    },
  });

  const deleteLesson = useMutation({
    mutationFn: ({ id, chapterId }) => client.delete(`/content/admin/lessons/${id}`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", vars.chapterId] });
    },
  });

  const reorderChapters = useMutation({
    mutationFn: (orders) => client.put("/content/admin/chapters/reorder", { orders }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-chapters", courseId] }),
  });

  const reorderLessons = useMutation({
    mutationFn: (orders) => client.put("/content/admin/lessons/reorder", { orders }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", vars[0]?.chapterId || ""] });
    },
  });

  function moveChapter(index, direction) {
    const list = [...chapters];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const temp = list[index].order;
    reorderChapters.mutate([
      { id: list[index]._id, order: list[target].order },
      { id: list[target]._id, order: temp },
    ]);
  }

  function moveLesson(lessons, index, direction) {
    const list = [...lessons];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const chapterId = list[index].chapter || list[index].chapterId;
    const temp = list[index].order;
    reorderLessons.mutate([
      { id: list[index]._id, order: list[target].order, chapterId },
      { id: list[target]._id, order: temp },
    ]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/admin/courses" className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-800">{course?.name || "Loading..."}</h1>
          <p className="text-xs text-slate-500">Manage course content — chapters and lessons</p>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setChapterForm({ open: true, title: "", description: "", editing: null })}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Chapter
        </button>
      </div>

      {/* Chapters list */}
      <div className="space-y-3">
        {!chapters ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
            <BookOpen className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">No chapters yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first chapter to start building course content</p>
          </div>
        ) : (
          chapters.map((chapter, ci) => (
            <ChapterBlock
              key={chapter._id}
              chapter={chapter}
              index={ci}
              total={chapters.length}
              openChapter={openChapter}
              setOpenChapter={setOpenChapter}
              onMoveUp={() => moveChapter(ci, -1)}
              onMoveDown={() => moveChapter(ci, 1)}
              onEdit={(ch) => setChapterForm({ open: true, title: ch.title, description: ch.description, editing: ch._id })}
              onDelete={(id) => deleteChapter.mutate(id)}
              onAddLesson={(chId) => setLessonForm({ open: true, chapterId: chId, title: "", type: "video", videoUrl: "", articleBody: "", duration: "", editing: null })}
              onEditLesson={(lesson) => setLessonForm({
                open: true, chapterId: lesson.chapter || chapter._id,
                title: lesson.title, type: lesson.type, videoUrl: lesson.videoUrl || "",
                articleBody: lesson.articleBody || "", duration: lesson.duration || "",
                editing: lesson._id,
              })}
              onDeleteLesson={(id) => deleteLesson.mutate({ id, chapterId: chapter._id })}
              fetchLessons={fetchLessons}
              createLesson={createLesson}
              updateLesson={updateLesson}
              moveLesson={moveLesson}
            />
          ))
        )}
      </div>

      {/* Chapter form drawer */}
      {chapterForm.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setChapterForm({ ...chapterForm, open: false })} />
          <div className="absolute top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in">
            <div className="flex items-center justify-between px-6 h-14 border-b border-slate-200 shrink-0">
              <h2 className="text-sm font-bold text-slate-800">
                {chapterForm.editing ? "Edit Chapter" : "New Chapter"}
              </h2>
              <button onClick={() => setChapterForm({ open: false, title: "", description: "", editing: null })} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Chapter title *</label>
                  <input
                    value={chapterForm.title}
                    onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                    placeholder="e.g. Introduction to Algebra"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Description (optional)</label>
                  <textarea
                    value={chapterForm.description}
                    onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
              <button onClick={() => setChapterForm({ open: false, title: "", description: "", editing: null })} className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => {
                  const body = { title: chapterForm.title, description: chapterForm.description };
                  if (chapterForm.editing) updateChapter.mutate({ id: chapterForm.editing, body });
                  else createChapter.mutate(body);
                }}
                disabled={!chapterForm.title.trim() || createChapter.isPending || updateChapter.isPending}
                className="h-9 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg cursor-pointer disabled:opacity-50"
              >
                {chapterForm.editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson form drawer */}
      {lessonForm.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setLessonForm({ open: false, chapterId: "", title: "", type: "video", videoUrl: "", articleBody: "", duration: "", editing: null })} />
          <div className="absolute top-0 bottom-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in">
            <div className="flex items-center justify-between px-6 h-14 border-b border-slate-200 shrink-0">
              <h2 className="text-sm font-bold text-slate-800">
                {lessonForm.editing ? "Edit Lesson" : "New Lesson"}
              </h2>
              <button onClick={() => setLessonForm({ open: false, chapterId: "", title: "", type: "video", videoUrl: "", articleBody: "", duration: "", editing: null })} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Lesson title *</label>
                  <input
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="e.g. Introduction to Algebra"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Type</label>
                    <select
                      value={lessonForm.type}
                      onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary"
                    >
                      <option value="video">Video</option>
                      <option value="article">Article</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Duration</label>
                    <input
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      placeholder="e.g. 15 min"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
                {lessonForm.type === "video" ? (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Video URL</label>
                    <div className="flex items-center h-9 rounded-lg border border-slate-200 overflow-hidden focus-within:border-primary">
                      <span className="px-3 text-sm text-slate-400 bg-slate-50 h-full flex items-center border-r border-slate-200">
                        <Film className="h-3.5 w-3.5" />
                      </span>
                      <input
                        value={lessonForm.videoUrl}
                        onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/embed/..."
                        className="flex-1 h-full px-3 text-sm outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Paste an embed URL (YouTube, Vimeo, etc.)</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Article content (HTML)</label>
                    <textarea
                      value={lessonForm.articleBody}
                      onChange={(e) => setLessonForm({ ...lessonForm, articleBody: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary resize-none font-mono"
                      placeholder="<p>Write your lesson content here...</p>"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
              <button onClick={() => setLessonForm({ open: false, chapterId: "", title: "", type: "video", videoUrl: "", articleBody: "", duration: "", editing: null })} className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => {
                  const body = {
                    title: lessonForm.title,
                    type: lessonForm.type,
                    videoUrl: lessonForm.videoUrl,
                    articleBody: lessonForm.articleBody,
                    duration: lessonForm.duration,
                  };
                  if (lessonForm.editing) updateLesson.mutate({ id: lessonForm.editing, body });
                  else createLesson.mutate({ chapterId: lessonForm.chapterId, body });
                }}
                disabled={!lessonForm.title.trim() || createLesson.isPending || updateLesson.isPending}
                className="h-9 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg cursor-pointer disabled:opacity-50"
              >
                {lessonForm.editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterBlock({ chapter, index, total, openChapter, setOpenChapter, onMoveUp, onMoveDown, onEdit, onDelete, onAddLesson, onEditLesson, onDeleteLesson, fetchLessons, createLesson, updateLesson, moveLesson }) {
  const isOpen = openChapter === chapter._id;
  const { data: lessons, isLoading } = fetchLessons(chapter._id);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => setOpenChapter(isOpen ? null : chapter._id)}
            className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
          >
            <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{chapter.title}</p>
              {chapter.description && (
                <p className="text-xs text-slate-500 truncate">{chapter.description}</p>
              )}
            </div>
          </button>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 ml-3">
          <button onClick={onMoveUp} disabled={index === 0} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-20 disabled:cursor-default" title="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-20 disabled:cursor-default" title="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button onClick={() => onAddLesson(chapter._id)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Add lesson">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onEdit(chapter)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit chapter">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(chapter._id)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete chapter">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : !lessons?.length ? (
            <div className="px-5 py-6 text-center">
              <p className="text-xs text-slate-400">No lessons yet</p>
              <button
                onClick={() => onAddLesson(chapter._id)}
                className="mt-2 text-xs font-medium text-[#0D9488] hover:underline cursor-pointer"
              >
                + Add first lesson
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lessons.map((lesson) => (
                <div key={lesson._id} className="flex items-center justify-between px-5 py-2.5 pl-12 hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {lesson.type === "video" ? (
                      <Play className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="text-sm text-slate-700 truncate">{lesson.title}</span>
                    <span className="text-[10px] text-slate-400 capitalize shrink-0">{lesson.type}</span>
                    {lesson.duration && (
                      <span className="text-[10px] text-slate-400 shrink-0">{lesson.duration}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveLesson(lessons, lessons.indexOf(lesson), -1)} disabled={lessons.indexOf(lesson) === 0} className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-20 disabled:cursor-default" title="Move up">
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button onClick={() => moveLesson(lessons, lessons.indexOf(lesson), 1)} disabled={lessons.indexOf(lesson) === lessons.length - 1} className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-20 disabled:cursor-default" title="Move down">
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-0.5" />
                    <button onClick={() => onEditLesson(lesson)} className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => onDeleteLesson(lesson._id)} className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
