import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import AddCourse from "./pages/student/AddCourse";
import Checkout from "./pages/student/Checkout";
import Payments from "./pages/student/Payments";
import CourseContent from "./pages/student/CourseContent";
import LessonView from "./pages/student/LessonView";
import MasterClass from "./pages/student/MasterClass";
import PastClasses from "./pages/student/PastClasses";
import Exams from "./pages/student/Exams";
import ExamView from "./pages/student/ExamView";
import SolveSheet from "./pages/student/SolveSheet";
import Performance from "./pages/student/Performance";
import QA from "./pages/student/QA";
import Community from "./pages/student/Community";
import LandingPage from "./pages/LandingPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminBatches from "./pages/admin/AdminBatches";
import AdminSubjects from "./pages/admin/AdminSubjects";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseContent from "./pages/admin/AdminCourseContent";
import AdminLiveClasses from "./pages/admin/AdminLiveClasses";
import AdminExams from "./pages/admin/AdminExams";

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <ToastProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />

        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Student Portal */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="courses" element={<CourseContent />} />
          <Route path="lessons/:lessonId" element={<LessonView />} />
          <Route path="master-class" element={<MasterClass />} />
          <Route path="past-classes" element={<PastClasses />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exams/:examId/take" element={<ExamView />} />
          <Route path="solve-sheet" element={<SolveSheet />} />
          <Route path="performance" element={<Performance />} />
          <Route path="qa" element={<QA />} />
          <Route path="payments" element={<Payments />} />
          <Route path="checkout/:courseId" element={<Checkout />} />
          <Route path="community" element={<Community />} />
        </Route>

        {/* Admin Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="batches" element={<AdminBatches />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:courseId/content" element={<AdminCourseContent />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="live-classes" element={<AdminLiveClasses />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </ToastProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
