import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
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

export default function CompleteProfile() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const sendPhoneOtp = useAuthStore((s) => s.sendPhoneOtp);
  const verifyPhoneOtp = useAuthStore((s) => s.verifyPhoneOtp);
  const navigate = useNavigate();

  const needsPhone = !user?.phone;
  const needsClass = !user?.classLevel;

  const [step, setStep] = useState(needsPhone ? "phone" : "profile");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [classLevel, setClassLevel] = useState(user?.classLevel?.toString() || "6");
  const [academicGroup, setAcademicGroup] = useState(user?.academicGroup || "n/a");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const showGroup = Number(classLevel) >= 9;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPhoneOtp(phone);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyPhoneOtp(phone, otp);
      if (needsClass) setStep("profile");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await updateProfile({ classLevel: Number(classLevel), academicGroup });
      navigate("/dashboard");
    } catch (err) {
      const issues = err.response?.data?.errors;
      if (issues?.length) setError(issues.map((i) => i.message).join(", "));
      else setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>Welcome, {user.name}!</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {step === "phone" && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <p className="text-sm text-muted-foreground">Verify your phone number to continue.</p>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending..." : "Send OTP"}</Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {phone}.</p>
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} className="text-center text-lg tracking-widest" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">{loading ? "Verifying..." : "Verify OTP"}</Button>
                </form>
              )}
            </div>
          )}

          {step === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={classLevel} onValueChange={(val) => { setClassLevel(val); if (Number(val) <= 8) setAcademicGroup("n/a"); }}>
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
                  <Label>Academic group</Label>
                  <Select value={academicGroup} onValueChange={setAcademicGroup}>
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
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Saving..." : "Save & continue"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
