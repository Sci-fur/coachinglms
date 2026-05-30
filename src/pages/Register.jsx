import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const classLevels = [6, 7, 8, 9, 10, 11, 12];
const academicGroups = [
  { value: "n/a", label: "N/A" },
  { value: "science", label: "Science" },
  { value: "business", label: "Business Studies" },
  { value: "arts", label: "Arts" },
];

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", classLevel: "6", academicGroup: "n/a",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [otp, setOtp] = useState("");
  const register = useAuthStore((s) => s.register);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const navigate = useNavigate();

  const showGroup = Number(form.classLevel) >= 9;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, classLevel: Number(form.classLevel) });
      setRegistered(true);
      await sendOtp(form.phone);
    } catch (err) {
      if (!err.response) {
        setError("Could not connect to the server.");
      } else {
        const issues = err.response?.data?.errors;
        setError(issues?.length ? issues.map((i) => i.message).join(", ") : err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(form.phone, otp);
      navigate("/dashboard");
    } catch (err) {
      setError(!err.response ? "Could not connect to the server." : err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await sendOtp(form.phone);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-gradient-to-br from-primary to-teal-900 items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Join our learning platform</h2>
          <p className="mt-4 text-blue-100 text-lg">Access courses, track your progress, and achieve your academic goals.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {!registered ? (
            <>
              <div className="mb-8 text-center lg:text-left">
                <h1 className="text-3xl font-bold">Create account</h1>
                <p className="text-muted-foreground mt-1">Get started with your student account</p>
              </div>

              {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={form.classLevel} onValueChange={(val) => setForm({ ...form, classLevel: val, academicGroup: Number(val) <= 8 ? "n/a" : form.academicGroup })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classLevels.map((c) => (
                          <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {showGroup && (
                    <div className="space-y-2">
                      <Label>Group</Label>
                      <Select value={form.academicGroup} onValueChange={(val) => setForm({ ...form, academicGroup: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicGroups.map((g) => (
                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating account..." : "Create account"}</Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Verify your phone</h1>
                <p className="text-muted-foreground mt-1">Enter the 6-digit code sent to {form.phone}</p>
              </div>

              {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} className="text-center text-lg tracking-widest" />
                <Button type="submit" disabled={loading} className="w-full">{loading ? "Verifying..." : "Verify & continue"}</Button>
              </form>

              <p className="text-sm text-muted-foreground mt-4">
                Didn&apos;t receive the code?{" "}
                <button type="button" onClick={handleResendOtp} disabled={loading} className="text-primary font-semibold hover:underline cursor-pointer disabled:opacity-50">
                  Resend OTP
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
