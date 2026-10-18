"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useLazyGetMeQuery } from "@/lib/redux/services/authApi";
import { setUser } from "@/lib/redux/slices/authSlice";
import { Role } from "@/types/api";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [triggerGetMe, { isFetching }] = useLazyGetMeQuery();
  const [isVerifying, setIsVerifying] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const activeToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("stockpilot_token")
          : null);

      if (!activeToken) {
        if (isMounted) {
          setIsVerifying(false);
          const redirectUrl =
            pathname && pathname !== "/"
              ? `/login?redirect=${encodeURIComponent(pathname)}`
              : "/login";
          router.replace(redirectUrl);
        }
        return;
      }

      if (!user) {
        try {
          const res = await triggerGetMe().unwrap();
          if (res?.data && isMounted) {
            dispatch(setUser(res.data));
          }
        } catch {
          if (isMounted) {
            setIsVerifying(false);
            router.replace("/login");
            return;
          }
        }
      }

      if (isMounted) {
        setIsVerifying(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token, user, pathname, router, dispatch, triggerGetMe]);

  if (isVerifying || isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <LoadingState message="Verifying session and security permissions..." />
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
          Access Restricted
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Your current account role ({user.role}) does not have permission to
          access this administrative route.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() =>
              router.push(
                user.role === "STAFF" ? "/staff/dashboard" : "/dashboard"
              )
            }
          >
            Go to My Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RoleGuard;
