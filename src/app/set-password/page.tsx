"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Boxes,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useVerifySetupTokenQuery,
  useSetPasswordMutation,
} from "@/lib/redux/services/authApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials } from "@/lib/redux/slices/authSlice";
import { toast } from "sonner";

function SetPasswordContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    data: verifyResponse,
    isLoading: isVerifying,
    isError: isVerifyError,
    error: verifyErrorData,
  } = useVerifySetupTokenQuery(token, {
    skip: !token,
  });

  const [setPasswordMutation, { isLoading: isSubmitting }] =
    useSetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }

    try {
      const response = await setPasswordMutation({
        token,
        password,
      }).unwrap();

      if (response.success && response.data) {
        dispatch(
          setCredentials({
            token: response.data.token,
            user: response.data.user,
          })
        );
        toast.success(
          `Welcome to StockPilot, ${response.data.user.name}! Your account is active.`
        );

        const target =
          response.data.user.role === "STAFF"
            ? "/staff/dashboard"
            : "/dashboard";
        router.push(target);
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      const msg =
        apiErr?.data?.message ||
        apiErr?.message ||
        "Failed to set password. The setup link may be invalid or expired.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen w-full flex-col justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Missing Setup Token
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              This account setup link is incomplete. Please check the full invitation link provided by your administrator.
            </p>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-screen w-full flex-col justify-center items-center bg-slate-50 py-12 px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-600">
            Validating invitation token...
          </p>
        </div>
      </div>
    );
  }

  if (isVerifyError || !verifyResponse?.data?.valid) {
    const errorObj = verifyErrorData as {
      data?: { message?: string };
      message?: string;
    };
    const failReason =
      errorObj?.data?.message ||
      errorObj?.message ||
      "This setup invitation has expired, already been used, or was revoked.";

    return (
      <div className="flex min-h-screen w-full flex-col justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Invalid or Expired Setup Link
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {failReason}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              For security, account setup links expire in 48 hours and can only be used once. Please contact your system administrator to generate a fresh link.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const staffName = verifyResponse.data.name;
  const staffEmail = verifyResponse.data.email;

  return (
    <div className="flex min-h-screen w-full flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Boxes className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              StockPilot
            </h1>
            <p className="text-xs font-medium text-slate-500">
              SME Inventory & Sales Management
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200 mb-3">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Secure First-Time Account Setup
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Set Your Password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Welcome aboard, <span className="font-semibold text-slate-900">{staffName}</span>! Configure your password to access the staff portal.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs text-slate-600">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Account:</span>
              <span className="font-semibold text-slate-800">{staffName}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Email:</span>
              <span className="font-medium text-slate-800">{staffEmail}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Assigned Role:</span>
              <span className="font-semibold text-blue-700">Staff Member</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 leading-relaxed"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-10 text-sm"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 text-sm"
                disabled={isSubmitting}
              />
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${
                    password.length >= 8
                      ? "text-emerald-600"
                      : "text-slate-300"
                  }`}
                />
                <span>At least 8 characters long</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${
                    password.length > 0 && password === confirmPassword
                      ? "text-emerald-600"
                      : "text-slate-300"
                  }`}
                />
                <span>Passwords match</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating Account...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Activate Account & Enter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          StockPilot SME Inventory Tracker &copy; 2026
        </p>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <SetPasswordContent />
    </React.Suspense>
  );
}
