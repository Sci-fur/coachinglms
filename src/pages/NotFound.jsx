import { Link } from "react-router-dom";
import { GraduationCap, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-slate-800">404</h1>
        <p className="text-slate-500 mt-2">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 h-10 px-5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg transition-all"
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}
