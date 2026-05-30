import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import {
  Loader2, BookOpen, ChevronDown, CheckCircle, Play,
  FileText, Clock, GraduationCap, ArrowRight,
} from "lucide-react";

export default function CourseContent() {
  const [openCourse, setOpenCourse] = useState(null);
  const [openChapter, setOpenChapter] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-course-content"],
    queryFn: async () => {
      const { data } = await client.get("/content/my-courses");
      return data.data;
    },
  });

  const toggleCourse = (id) => setOpenCourse(openCourse === id ? null : id);
  const toggleChapter = (id) => setOpenChapter(openChapter === id ? null : id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
        <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <BookOpen className="h-6 w-6 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-600">No enrolled courses yet</p>
        <p className="text-sm text-slate-400 mt-1">Browse programs and enroll to access content</p>
        <Link
          to="/dashboard/add-course"
          className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all"
        >
          Browse Programs <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {data.map((course) => {
        const progressPct = course.totalLessons > 0
          ? Math.round((course.completedLessons / course.totalLessons) * 100)
          : 0;

        return (
          <div key={course.course._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden card-lift">
            {/* Course header */}
            <button
              onClick={() => toggleCourse(course.course._id)}
              className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{course.course.name}</h3>
                  {course.course.subtitle && (
                    <p className="text-xs text-slate-500 truncate">{course.course.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                  <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0D9488] to-[#0F766E] rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="font-semibold text-slate-700">{progressPct}%</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${openCourse === course.course._id ? "rotate-180" : ""}`} />
              </div>
            </button>

            {/* Chapters & lessons */}
            {openCourse === course.course._id && (
              <div className="border-t border-slate-100">
                {course.chapters.map((chapter) => (
                  <div key={chapter._id}>
                    <button
                      onClick={() => toggleChapter(chapter._id)}
                      className="w-full flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                          <BookOpen className="h-3 w-3 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{chapter.title}</p>
                          <p className="text-xs text-slate-400">{chapter.completedLessons}/{chapter.totalLessons} lessons</p>
                        </div>
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${openChapter === chapter._id ? "rotate-180" : ""}`} />
                    </button>

                    {openChapter === chapter._id && (
                      <div className="bg-slate-50/50 border-t border-slate-100">
                        {chapter.lessons.map((lesson) => (
                          <Link
                            key={lesson._id}
                            to={`/dashboard/lessons/${lesson._id}`}
                            className="flex items-center gap-3 px-5 py-2.5 pl-14 hover:bg-slate-100 transition-colors group"
                          >
                            {lesson.completed ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : lesson.type === "video" ? (
                              <Play className="h-4 w-4 text-slate-400 shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                            )}
                            <span className={`text-sm flex-1 min-w-0 truncate ${lesson.completed ? "text-slate-500" : "text-slate-700 group-hover:text-slate-900"}`}>
                              {lesson.title}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                              <span className="capitalize">{lesson.type}</span>
                              {lesson.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
