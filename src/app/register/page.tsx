"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, ArrowLeft, ShieldAlert, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    setValidationError(
      "Public self-registration is disabled by enterprise security policy. Please contact your StockPilot Administrator to provision your Staff credentials."
    );
  };

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

        <h2 className="mt-8 text-center text-xl font-semibold tracking-tight text-slate-900">
          Staff Account Provisioning
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enterprise access control and staff onboarding guidelines
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-900">
                  Admin-Provisioned Access Only
                </h3>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  To protect business inventory and financial records, public
                  self-registration is disabled. All Staff accounts must be
                  created directly by an Administrator via the User Management
                  portal.
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {validationError && (
              <div
                className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 leading-relaxed"
                role="alert"
              >
                {validationError}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Full Name
              </label>
              <div className="mt-1">
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="h-10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Work Email
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="h-10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Desired Password
              </label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
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
                className="block text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat desired password"
                  className="h-10"
                />
              </div>
            </div>

            <Button type="submit" variant="outline" className="w-full h-10 text-sm font-medium mt-2">
              Request Staff Account
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              How to obtain credentials:
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ask your Business Admin to add you under Users.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Receive your assigned email and initial temporary password.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Sign in and manage your personal profile securely.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          StockPilot SME Inventory Tracker &copy; 2026
        </p>
      </div>
    </div>
  );
}
