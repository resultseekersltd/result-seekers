import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight styled table primitives (first use in the project — Task
 * 014's admin CMS/Expert-Pool/Audit-Log lists) — composable pieces rather
 * than one big <DataTable columns={} data={} /> abstraction, so each admin
 * page keeps full control over its own columns.
 */
export function Table({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="border-border rounded-card overflow-x-auto border">
      <table className={cn("w-full border-collapse text-left", className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: ComponentPropsWithoutRef<"thead">) {
  return <thead className={cn("bg-muted", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentPropsWithoutRef<"tbody">) {
  return <tbody className={cn("divide-border divide-y", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentPropsWithoutRef<"tr">) {
  return <tr className={cn("hover:bg-muted/50 transition-colors", className)} {...props} />;
}

export function TableHeaderCell({ className, ...props }: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className={cn(
        "text-caption text-muted-foreground px-4 py-3 font-semibold tracking-wide uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return <td className={cn("text-body text-foreground px-4 py-3", className)} {...props} />;
}
