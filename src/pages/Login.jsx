import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import useAuthStore from "../store/authStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const googleLogin = useAuthStore((s) => s.googleLogin);

  const googleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      try {
        const result = await googleLogin(tokenResponse.access_token);
        navigate(result.needsProfileCompletion ? "/complete-profile" : "/dashboard");
      } catch (err) {
        setError(err.response?.data?.message || "Google sign in failed");
      }
    },
    onError: () => setError("Google sign in failed"),
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const goToDashboard = (user) => {
    navigate(user.role === "admin" ? "/admin" : "/dashboard");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      goToDashboard(user);
    } catch (err) {
      setError(!err.response ? "Could not connect to the server." : err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendOtp(phone);
      setOtpSent(true);
    } catch (err) {
      setError(!err.response ? "Could not connect to the server." : err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp(phone, otp);
      goToDashboard(result.user);
    } catch (err) {
      setError(!err.response ? "Could not connect to the server." : err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <Tabs defaultValue="email" onValueChange={() => { setOtpSent(false); setOtp(""); setError(""); }}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="email" className="flex-1">Email & password</TabsTrigger>
              <TabsTrigger value="phone" className="flex-1">Phone OTP</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
                  </div>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign in"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="phone">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending..." : "Send OTP"}</Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <p className="text-sm text-muted-foreground">OTP sent to <span className="font-medium text-foreground">{phone}</span></p>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input id="otp" type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="text-center text-lg tracking-widest" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">{loading ? "Verifying..." : "Verify & sign in"}</Button>
                  <Button type="button" variant="link" onClick={() => { setOtpSent(false); setOtp(""); setError(""); }} className="w-full">Use a different number</Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or continue with</span></div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => googleSignIn()}
              className="w-full max-w-[300px]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex bg-gradient-to-br from-primary to-teal-900 items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Coaching Learning Management System</h2>
          <p className="mt-4 text-blue-100 text-lg">Manage courses, track progress, and deliver education seamlessly.</p>
        </div>
      </div>
    </div>
  );
}
