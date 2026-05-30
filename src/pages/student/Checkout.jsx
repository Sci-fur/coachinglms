import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import client from "../../api/client";
import { useToast } from "../../components/Toast";
import { Loader2, GraduationCap, MapPin, Clock, Users, Check, ArrowRight, ChevronLeft } from "lucide-react";

const typeLabels = {
  "college-admission": "College Admission",
  "ssc-model-test": "SSC Model Test",
  "academic-revision": "Academic & Revision",
  "foundation": "Foundation",
};

const typeGradients = {
  "college-admission": "from-violet-600 to-purple-700",
  "ssc-model-test": "from-emerald-600 to-teal-700",
  "academic-revision": "from-orange-600 to-amber-600",
  "foundation": "from-blue-600 to-indigo-700",
};

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(false);
  const toast = useToast();

  const { data: courses } = useQuery({
    queryKey: ["student-courses-public"],
    queryFn: async () => {
      const { data } = await client.get("/student/courses");
      return data.data;
    },
  });

  const course = courses?.find((c) => c._id === courseId);

  const enrollMutation = useMutation({
    mutationFn: () => client.post("/student/enroll", { courseId }),
    onSuccess: () => {
      setEnrolled(true);
      setTimeout(() => navigate("/dashboard/payments"), 1200);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Enrollment failed. Please try again.";
      toast(msg, "error");
    },
  });

  if (!course) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const gradient = typeGradients[course.type] || "from-gray-600 to-gray-700";

  if (enrolled) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Enrolled successfully!</h2>
        <p className="text-sm text-slate-500 mt-1">Redirecting to payments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />

        <div className="p-6 space-y-5">
          <div>
            <h1 className="text-lg font-bold text-slate-800">{course.title}</h1>
            {course.subtitle && (
              <p className="text-sm text-slate-500 mt-1">{course.subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {typeLabels[course.type]}
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Class {course.class}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            {course.scheduleText && (
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{course.scheduleText}</span>
              </div>
            )}
            {course.duration && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{course.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{course.enrolled} enrolled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Fee Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Program fee</span>
            <span className="text-slate-800 font-medium">৳{course.fee?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Discount</span>
            <span className="text-emerald-600 font-medium">৳0</span>
          </div>
          <div className="border-t border-slate-100 pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Total due</span>
              <span className="text-lg font-bold text-slate-800">৳{course.fee?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => enrollMutation.mutate()}
          disabled={enrollMutation.isPending}
          className="mt-5 w-full h-11 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {enrollMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Confirm Enrollment
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-xs text-slate-400 text-center mt-3">
          By enrolling, you agree to the terms and conditions. You can pay later from the payments page.
        </p>
      </div>
    </div>
  );
}
