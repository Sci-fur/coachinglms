import { useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function ForgotPassword() {
  const [input, setInput] = useState("");
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await forgotPassword(input);
      if (data?.resetUrl) setResetLink(data.resetUrl);
      setSent(true);
    } catch (err) {
      setError(!err.response ? "Could not connect to the server." : err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle>Check your inbox</CardTitle>
            <CardDescription>If an account exists, you will receive a reset link shortly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resetLink && (
              <div className="p-3 bg-muted rounded-lg border text-left">
                <p className="text-xs text-muted-foreground mb-1">Dev mode — reset link:</p>
                <a href={resetLink} className="text-sm text-primary hover:underline break-all font-medium">{resetLink}</a>
              </div>
            )}
            <Link to="/login"><Button variant="outline" className="w-full">Back to sign in</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Forgot password</h1>
          <p className="text-muted-foreground mt-1">Enter your email or phone to receive a reset link</p>
        </div>

        {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Email or phone</Label>
            <Input id="input" type="text" required value={input} onChange={(e) => setInput(e.target.value)} placeholder="you@example.com or 01XXXXXXXXX" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending..." : "Send reset link"}</Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/login" className="text-primary font-semibold hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
