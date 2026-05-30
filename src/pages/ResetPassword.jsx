import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (!token) { setError("Invalid reset link"); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(!err.response ? "Could not connect to the server." : err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle>Password reset successful</CardTitle>
            <CardDescription>You can now sign in with your new password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login"><Button className="w-full">Sign in</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="text-muted-foreground mt-1">Enter your new password below</p>
        </div>

        {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Resetting..." : "Reset password"}</Button>
        </form>
      </div>
    </div>
  );
}
