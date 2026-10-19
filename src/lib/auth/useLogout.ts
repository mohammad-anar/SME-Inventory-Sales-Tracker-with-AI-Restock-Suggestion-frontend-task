"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";
import { useLogoutMutation } from "@/lib/redux/services/authApi";
import { baseApi } from "@/lib/redux/services/baseApi";
import { toast } from "sonner";

export const useLogoutHandler = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      toast.success("Logged out successfully");
    } catch {
      toast.warning("Server revocation could not be confirmed. Session cleared locally.");
    } finally {
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      router.push("/login");
    }
  };

  return { handleLogout, isLoggingOut };
};

export default useLogoutHandler;
