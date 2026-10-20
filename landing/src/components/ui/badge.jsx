import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#243f38] text-[#f7f3ea]",
        income: "border-transparent bg-[#e5f4eb] text-[#1f7a4d]",
        expense: "border-transparent bg-[#fde8e0] text-[#c4522a]",
        outline: "border-[#243f38]/15 bg-white/40 text-[#1c1915]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
