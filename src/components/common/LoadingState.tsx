import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function LoadingState({
  message = "Loading data...",
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm",
        className
      )}
      {...props}
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export default LoadingState;
