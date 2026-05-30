import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import client from "../../api/client";
import { Loader2, Clock, AlertTriangle, CheckCircle, XCircle, ArrowLeft, FileText, BookOpen } from "lucide-react";

export default function ExamView() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["exam-start", examId],
    queryFn: async () => {
      const { data } = await client.get(`/student/exams/${examId}/start`);
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  const submitMutation = useMutation({
    mutationFn: (payload) => client.post(`/student/exams/${examId}/submit`, payload),
  });

  const exam = data?.exam;
  const questions = data?.questions || [];
  const mode = data?.mode || "take";
  const isPractice = mode === "practice" || submitMutation.isSuccess;

  // Timer effect (only for take mode)
  useEffect(() => {
    if (mode !== "take") return;
    if (exam?.duration && !data?.submission?.submittedAt) {
      const startedAt = data?.submission?.startedAt ? new Date(data.submission.startedAt).getTime() : Date.now();
      const endTime = startedAt + exam.duration * 60 * 1000;
      const tick = () => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0 && !submitMutation.isSuccess && !submitMutation.isPending) {
          handleSubmit();
        }
      };
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [exam?.duration, data?.submission?.startedAt, mode]);

  const handleSubmit = useCallback(async () => {
    if (submitMutation.isPending || submitMutation.isSuccess) return;
    const formatted = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      selectedOption: value || "",
    }));
    submitMutation.mutate({ answers: formatted });
  }, [answers, submitMutation]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertTriangle className="h-10 w-10 text-red-400 mb-3" />
        <p className="font-semibold text-slate-600">Exam not found</p>
      </div>
    );
  }

  // ===== PRACTICE RESULTS VIEW =====
  if (isPractice) {
    const submitResult = submitMutation.data?.data?.data;
    const submission = submitResult?.submission || data?.submission;
    const resultQuestions = submitResult?.questions || questions;
    const mcqScore = submitResult?.mcqScore ?? submission?.totalMarksObtained ?? 0;
    const totalMarks = exam.totalMarks;
    const pct = totalMarks > 0 ? Math.min((mcqScore / totalMarks) * 100, 100) : 0;
    const mcqTotal = questions.filter((q) => q.type === "mcq").reduce((s, q) => s + (q.marks || 0), 0);
    const writtenCount = questions.filter((q) => q.type === "written").length;
    const isGraded = submission?.status === "graded";

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <button onClick={() => navigate("/dashboard/exams")} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to Exams
        </button>

        {/* Score summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isGraded ? "bg-emerald-50" : "bg-blue-50"}`}>
            {isGraded ? <CheckCircle className="h-8 w-8 text-emerald-600" /> : <BookOpen className="h-8 w-8 text-blue-600" />}
          </div>
          <h2 className="text-lg font-bold text-slate-800">{isGraded ? "Exam Graded!" : "Practice Results"}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isGraded
              ? `Final score: ${submission?.totalMarksObtained ?? 0}${totalMarks != null ? `/${totalMarks}` : ""}`
              : writtenCount > 0
                ? `MCQ score: ${mcqScore}/${mcqTotal} · Self-evaluate your written answers below`
                : `Your score: ${mcqScore}${totalMarks != null ? `/${totalMarks}` : ""}`
            }
          </p>
          <div className="mt-4 inline-flex items-center gap-6 bg-slate-50 rounded-xl px-6 py-3">
            <div>
              <p className="text-xs text-slate-500">Score</p>
              <p className="text-2xl font-bold text-slate-800">{isGraded ? submission?.totalMarksObtained ?? 0 : mcqScore}{totalMarks != null ? `/${totalMarks}` : ""}</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <p className="text-xs text-slate-500">Percentage</p>
              <p className={`text-2xl font-bold ${pct >= 40 ? "text-emerald-600" : "text-red-600"}`}>
                {pct.toFixed(0)}%
              </p>
            </div>
          </div>
          {writtenCount > 0 && (
            <p className="text-xs text-blue-600 mt-4 flex items-center justify-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> Written answers include a reference answer for self-evaluation
            </p>
          )}
        </div>

        {/* Question review */}
        <h3 className="text-sm font-bold text-slate-700 px-1">Answer Review</h3>
        <div className="space-y-4">
          {resultQuestions.map((q, i) => {
            const sa = q?.studentAnswer;
            const isCorrect = q.type === "mcq" && sa?.selectedOption === q.correctAnswer;
            const isWrong = q.type === "mcq" && sa?.selectedOption && sa?.selectedOption !== q.correctAnswer;
            return (
              <div key={q._id || i} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-medium text-slate-800">
                    <span className="text-slate-400 mr-2">{i + 1}.</span>
                    {q?.questionText || "Question"}
                  </p>
                  <span className="shrink-0 text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{q?.marks || 0} mark{(q?.marks || 0) > 1 ? "s" : ""}</span>
                </div>

                {q.type === "mcq" ? (
                  <div className="space-y-1.5">
                    {(q?.options || []).map((opt) => {
                      const isSelected = sa?.selectedOption === opt?.label;
                      const isCorrectOpt = q.correctAnswer === opt?.label;
                      let btnClass = "border-slate-200 text-slate-600";
                      if (isCorrectOpt) btnClass = "border-emerald-400 bg-emerald-50 text-slate-800";
                      else if (isSelected && isCorrect) btnClass = "border-emerald-400 bg-emerald-50 text-slate-800";
                      else if (isSelected && isWrong) btnClass = "border-red-300 bg-red-50 text-slate-800";
                      return (
                        <div key={opt?.label || Math.random()} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm ${btnClass}`}>
                          <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isCorrectOpt ? "border-emerald-500 bg-emerald-500" : isSelected && isWrong ? "border-red-400 bg-red-400" : "border-slate-300"
                          }`}>
                            {(isCorrectOpt || (isSelected && isWrong)) && (
                              isCorrectOpt ? <CheckCircle className="h-3 w-3 text-white" /> : <XCircle className="h-3 w-3 text-white" />
                            )}
                          </span>
                          <span className="font-medium text-xs text-slate-500 w-5">{opt?.label}.</span>
                          <span className="flex-1">{opt?.text}</span>
                          {isSelected && <span className="text-[10px] font-medium text-slate-400">Your answer</span>}
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-3 pt-1">
                      {sa?.selectedOption ? (
                        isCorrect ? (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Correct</span>
                        ) : (
                          <span className="text-xs font-medium text-red-600 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Incorrect — correct answer is <strong>{q.correctAnswer}</strong></span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">Not answered</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Your answer:</p>
                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                        <p className="text-xs text-slate-700 whitespace-pre-wrap">{sa?.textAnswer || "(no answer)"}</p>
                      </div>
                    </div>
                    {q?.referenceAnswer && (
                      <div>
                        <p className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> Reference answer (self-evaluate):
                        </p>
                        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-3">
                          <p className="text-xs text-emerald-800 whitespace-pre-wrap">{q.referenceAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center pb-8">
          <button onClick={() => navigate("/dashboard/exams")} className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer">
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // ===== TAKE EXAM VIEW =====
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-5 py-3">
        <div>
          <h1 className="text-sm font-bold text-slate-800">{exam.title}</h1>
          <p className="text-xs text-slate-500">{exam.totalMarks} marks · {questions.length} questions</p>
        </div>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 text-sm font-bold ${timeLeft < 300 ? "text-red-600" : "text-slate-700"}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}
          <span className="text-xs text-slate-500">{answered}/{questions.length} answered</span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-400">No questions in this exam</p>
          </div>
        ) : questions.map((q, i) => (
          <div key={q._id || i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-sm font-medium text-slate-800">
                <span className="text-slate-400 mr-2">{i + 1}.</span>
                {q?.questionText || "Question"}
              </p>
              <span className="shrink-0 text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{q?.marks || 0} mark{(q?.marks || 0) > 1 ? "s" : ""}</span>
            </div>

            {q?.type === "mcq" ? (
              <div className="space-y-1.5">
                {(q?.options || []).map((opt) => (
                  <button
                    key={opt?.label || Math.random()}
                    onClick={() => setAnswers({ ...answers, [q._id]: opt?.label })}
                    className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm transition-all cursor-pointer ${
                      answers[q._id] === opt?.label
                        ? "border-[#0D9488] bg-[#0D9488]/5 text-slate-800"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[q._id] === opt?.label ? "border-[#0D9488] bg-[#0D9488]" : "border-slate-300"
                    }`}>
                      {answers[q._id] === opt?.label && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span className="font-medium text-xs text-slate-500 w-5">{opt?.label}.</span>
                    <span>{opt?.text}</span>
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[q?._id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q?._id]: e.target.value })}
                className="w-full h-28 px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm outline-none resize-none"
                placeholder="Write your answer..."
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-5 py-4">
        <p className="text-xs text-slate-500">
          {answered === questions.length
            ? "All questions answered!"
            : `${questions.length - answered} questions remaining`}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/dashboard/exams")} className="h-9 px-4 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || answered === 0}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {submitMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            {submitMutation.isPending ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
