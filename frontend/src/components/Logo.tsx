import { cn } from "@/lib/utils";
import { TreeDeciduous } from "lucide-react";
import React from "react";

export const Logo = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div className={cn("inline-flex", className)} {...props}>
      <a href="/" className="flex items-center gap-3 font-bold">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
          <TreeDeciduous className="h-6 w-6" />
        </div>
        <span className="text-2xl font-semibold">EcoX</span>
      </a>
    </div>
  );
};
