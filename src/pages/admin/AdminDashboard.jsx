import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Users, BookOpen, GraduationCap, FolderKanban } from "lucide-react";

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 card-lift">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
  </div>
);

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const { data } = await client.get("/admin/dashboard");
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={data?.totalStudents || 0} icon={Users} />
        <StatCard title="Active Batches" value={data?.totalBatches || 0} icon={FolderKanban} />
        <StatCard title="Published Courses" value={data?.totalCourses || 0} icon={GraduationCap} />
        <StatCard title="Active Subjects" value={data?.totalSubjects || 0} icon={BookOpen} />
      </div>

      {data?.studentsByClass?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Students by class</h3>
          <div className="flex gap-8 flex-wrap">
            {data.studentsByClass.map((item) => (
              <div key={item._id} className="text-center">
                <div className="text-xl font-bold text-slate-800">{item.count}</div>
                <div className="text-xs text-slate-500">Class {item._id}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
