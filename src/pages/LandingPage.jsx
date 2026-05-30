import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../store/authStore";
import client from "../api/client";
import {
  Menu, X, GraduationCap, MapPin, ChevronRight, Sparkles,
  ArrowRight, Monitor, ChevronDown, Star, ExternalLink,
} from "lucide-react";

const typeLabels = {
  "college-admission": "College Admission",
  "ssc-model-test": "SSC Model Test",
  "academic-revision": "Academic Revision",
  "foundation": "Foundation",
};

const cardThemes = [
  { from: "from-violet-600", to: "to-purple-700", badge: "bg-violet-500/12 text-violet-300" },
  { from: "from-emerald-600", to: "to-teal-700", badge: "bg-emerald-500/12 text-emerald-300" },
  { from: "from-orange-600", to: "to-amber-600", badge: "bg-amber-500/12 text-amber-300" },
  { from: "from-blue-600", to: "to-indigo-700", badge: "bg-blue-500/12 text-blue-300" },
  { from: "from-rose-600", to: "to-pink-700", badge: "bg-rose-500/12 text-rose-300" },
  { from: "from-cyan-600", to: "to-teal-700", badge: "bg-cyan-500/12 text-cyan-300" },
];

const thumbEmojis = ["📘", "🎯", "📝", "🏆", "🌍", "🗣️"];

const branches = [
  { name: "Uttara", bn: "উত্তরা", addressBn: "হাউস-১২, রোড-৪, সেক্টর-৬, উত্তরা, ঢাকা" },
  { name: "Panthapath", bn: "পান্থপথ", addressBn: "লেভেল-৩, র্যাংস নাসিম স্কয়ার, পান্থপথ, ঢাকা" },
  { name: "Mirpur", bn: "মিরপুর", addressBn: "প্লট-১৪, ব্লক-সি, সেকশন-৬, মিরপুর, ঢাকা" },
  { name: "Moghbazar", bn: "মগবাজার", addressBn: "কা-৭৮, কুড়িল ফ্লাইওভার, মগবাজার, ঢাকা" },
  { name: "Chattogram", bn: "চট্টগ্রাম", addressBn: "২০/এ, ও.আর. নিজাম রোড, পাঁচলাইশ, চট্টগ্রাম" },
];

const faqs = [
  { q: "কে এই প্রোগ্রামে ভর্তি হতে পারে?", a: "আমাদের প্রোগ্রামগুলি শ্রেণি ৬ থেকে ১২ পর্যন্ত শিক্ষার্থীদের জন্য ডিজাইন করা হয়েছে, পাশাপাশি দক্ষতা উন্নয়নে আগ্রহী প্রাপ্তবয়স্কদের জন্যও উন্মুক্ত।" },
  { q: "ক্লাস কি অনলাইন এবং অফলাইন উভয়ভাবেই পাওয়া যায়?", a: "হ্যাঁ! আমরা অনলাইন এবং অফলাইন উভয় ক্লাসই অফার করি। আপনি আপনার সুবিধামত পদ্ধতি বেছে নিতে পারেন।" },
  { q: "কিভাবে ফি পরিশোধ করব?", a: "ভর্তি হওয়ার পর আপনার স্টুডেন্ট ড্যাশবোর্ড থেকে বিকাশ বা অন্যান্য অনলাইন পদ্ধতিতে সরাসরি ফি পরিশোধ করতে পারবেন।" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const { data: courses } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data } = await client.get("/public/courses");
      return data.data;
    },
  });

  const featured = courses?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      {/* ===== HEADER ===== */}
      <header className="bg-white text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">LMS Coaching</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
              <a href="#programs" className="hover:text-slate-800 transition-colors">Programs</a>
              <a href="#branches" className="hover:text-slate-800 transition-colors">Branches</a>
              <a href="#faq" className="hover:text-slate-800 transition-colors">FAQ</a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="h-9 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 transition-all flex items-center">
                    Login
                  </Link>
                  <Link to="/register" className="h-9 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center">
                    Register
                  </Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 cursor-pointer">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenu && (
            <div className="md:hidden pb-4 border-t border-slate-100 pt-3 space-y-2">
              <a href="#programs" className="block text-sm text-slate-600 py-2" onClick={() => setMobileMenu(false)}>Programs</a>
              <a href="#branches" className="block text-sm text-slate-600 py-2" onClick={() => setMobileMenu(false)}>Branches</a>
              <a href="#faq" className="block text-sm text-slate-600 py-2" onClick={() => setMobileMenu(false)}>FAQ</a>
              {user ? (
                <Link to="/dashboard" className="block text-sm font-bold text-emerald-600 py-2" onClick={() => setMobileMenu(false)}>Dashboard</Link>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1 text-center text-sm font-medium py-2 border border-slate-200 rounded-lg" onClick={() => setMobileMenu(false)}>Login</Link>
                  <Link to="/register" className="flex-1 text-center text-sm font-bold text-white bg-emerald-600 py-2 rounded-lg" onClick={() => setMobileMenu(false)}>Register</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ===== SUB-HEADER PILLS ===== */}
      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 h-8 px-5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Sparkles className="h-3 w-3" />
            Free class (6-10)
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 h-8 px-5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Sparkles className="h-3 w-3" />
            Free class (HSC)
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/8 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-400/4 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5">
              <Star className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">Bangladesh's Leading Coaching Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                The new joy of learning
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                in the classroom
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Join Bangladesh's most trusted coaching center. Learn from expert teachers with structured programs designed for SSC, HSC & Admission test success.
            </p>
          </div>
        </div>
      </section>

      {/* ===== BRANCHES ===== */}
      <section id="branches" className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="relative bg-[#0D1117] rounded-2xl border border-[rgba(255,255,255,0.06)] p-4 sm:p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/3 rounded-full blur-[80px]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <h2 className="text-sm font-bold text-white">আমাদের অফলাইন সেন্টার</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {branches.map((b) => (
                <div
                  key={b.name}
                  className="group bg-[#141921] rounded-xl border border-[rgba(255,255,255,0.06)] p-3.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-white">{b.bn}</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{b.addressBn}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section id="programs" className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="relative bg-[#0D1117] rounded-2xl border border-[rgba(255,255,255,0.06)] p-4 sm:p-6 lg:p-8 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-500/4 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-violet-500/3 rounded-full blur-[80px]" />

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Our Programs</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Choose the program that fits your goals</p>
              </div>
              {user && (
                <Link
                  to="/dashboard/add-course"
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.length === 0 ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#141921] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
                      <div className="aspect-[2/1] bg-slate-800/50 animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="h-3 w-20 bg-slate-700/50 rounded animate-pulse" />
                        <div className="h-4 w-40 bg-slate-700/50 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-slate-700/30 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                featured.map((course, i) => {
                  const theme = cardThemes[i % cardThemes.length];
                  const emoji = thumbEmojis[i % thumbEmojis.length];
                  return (
                    <div
                      key={course._id}
                      className="group bg-[#141921] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Thumbnail banner */}
                      <div className={`relative aspect-[2/1] bg-gradient-to-br ${theme.from} ${theme.to} flex items-center justify-center overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10" />
                        <span className="relative text-4xl sm:text-5xl">{emoji}</span>
                        <div className="absolute bottom-2 left-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${theme.badge}`}>
                            {typeLabels[course.type] || course.type}
                          </span>
                        </div>
                      </div>

                      {/* Body — title + price + enroll only */}
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 min-h-[2.5rem]">
                          {course.title}
                        </h3>
                        {course.subtitle && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{course.subtitle}</p>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                          <span className="text-base font-bold text-white">৳{course.fee?.toLocaleString()}</span>
                          {user ? (
                            <Link
                              to={`/dashboard/checkout/${course._id}`}
                              className="inline-flex items-center gap-1 h-8 px-3.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
                            >
                              Enroll <ChevronRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <Link
                              to="/register"
                              className="inline-flex items-center gap-1 h-8 px-3.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
                            >
                              Enroll <ChevronRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              {user ? (
                <Link
                  to="/dashboard/add-course"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Join classes at our centers <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Join free classes at our centers <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ONLINE SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative bg-gradient-to-br from-[#0D1117] to-[#0B0E14] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 sm:p-8 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/4 rounded-full blur-[120px]" />
          <div className="relative max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-lg shadow-emerald-500/5">
              <Monitor className="h-6 w-6 text-emerald-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Let's continue learning online from home without interruption
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Access all your courses, live classes, and study materials from anywhere. Our online platform brings the classroom experience to your home.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-medium text-slate-300 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-lg font-bold text-white text-center mb-6">সাধারণ জিজ্ঞাসা</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#0D1117] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[#0B0E14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center shadow-lg shadow-emerald-500/15">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">LMS Coaching</span>
            </div>
            <p className="text-xs text-slate-500">© 2026 LMS Coaching. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
