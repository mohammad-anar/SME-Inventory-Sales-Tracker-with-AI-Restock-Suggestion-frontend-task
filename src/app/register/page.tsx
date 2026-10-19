"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, ShieldAlert, ArrowLeft, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
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

        <h2 className="mt-8 text-center text-xl font-bold tracking-tight text-slate-900">
          Staff Account Registration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Admin-managed access policy
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 border border-blue-100">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Registration Is Admin-Managed
          </h3>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            In accordance with company security policies, public registration is disabled. All Staff accounts are provisioned exclusively by authorized system administrators.
          </p>

          <div className="my-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left text-xs text-slate-600 space-y-3">
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">1. Account Provisioning:</span>
                <p className="text-slate-500 mt-0.5">
                  Your administrator registers your name and work email in the Staff Management console.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <KeyRound className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">2. One-Time Setup Link:</span>
                <p className="text-slate-500 mt-0.5">
                  You receive a cryptographically secure, single-use link to create your personal password.
                </p>
              </div>
            </div>
          </div>

          <Button asChild className="w-full h-10 font-semibold">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          StockPilot SME Inventory Tracker &copy; 2026
        </p>
      </div>
    </div>
  );
}
