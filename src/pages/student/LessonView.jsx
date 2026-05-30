import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import {
  Loader2, CheckCircle, Play, FileText, ChevronLeft, ChevronRight,
  ArrowLeft, Download, Clock, Check,
} from "lucide-react";

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data } = await client.get(`/content/lessons/${lessonId}`);
      return data.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => client.post(`/content/lessons/${lessonId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["my-course-content"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Lesson not found</p>
      </div>
    );
  }

  const courseName = data.chapter?.course?.name || "";
  const chapterName = data.chapter?.title || "";

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Back link */}
      <Link
        to="/dashboard/courses"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      {/* Breadcrumb */}
      <div className="text-xs text-slate-400">
        {courseName} <span className="mx-1">/</span> {chapterName}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800">{data.title}</h1>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
          <span className="capitalize inline-flex items-center gap-1">
            {data.type === "video" ? <Play className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            {data.type}
          </span>
          {data.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {data.duration}
            </span>
          )}
          {data.completed && (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Video or article content */}
      {data.type === "video" && data.videoUrl ? (
        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
          <iframe
            src={data.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={data.title}
          />
        </div>
      ) : data.type === "article" && data.articleBody ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 prose prose-slate max-w-none text-sm">
          <div dangerouslySetInnerHTML={{ __html: data.articleBody }} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">
          Content not available yet.
        </div>
      )}

      {/* Materials */}
      {data.materials?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Study Materials</h3>
          <div className="space-y-2">
            {data.materials.map((m, i) => (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm"
              >
                <Download className="h-4 w-4 text-[#0D9488]" />
                <span className="flex-1 text-slate-700">{m.name}</span>
                <span className="text-xs text-[#0D9488] font-medium">Download</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {data.prevLesson && (
            <Link
              to={`/dashboard/lessons/${data.prevLesson._id}`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {data.prevLesson.title?.length > 25
                ? data.prevLesson.title.slice(0, 25) + "..."
                : data.prevLesson.title}
            </Link>
          )}
        </div>

        <div className="flex gap-2">
          {!data.completed && (
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              {completeMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Mark as Complete
            </button>
          )}

          {data.nextLesson && (
            <Link
              to={`/dashboard/lessons/${data.nextLesson._id}`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
