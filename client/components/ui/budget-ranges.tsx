import React from "react";
import { cn } from "@/lib/utils";

interface BudgetRangesProps {
  className?: string;
  onClick?: () => void;
}

const BudgetRanges: React.FC<BudgetRangesProps> = ({ className, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#0E766E]/25 bg-white px-4 py-2 text-sm font-semibold text-[#0F766E] shadow-[0_8px_22px_-16px_rgba(14,118,110,0.6)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40 focus-visible:ring-offset-2",
        onClick ? "hover:bg-[#0F766E]/5 active:bg-[#0F766E]/10" : "cursor-default opacity-80",
        className,
      )}
      aria-label="View detailed budget ranges"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-[#0F766E]"
      >
        <path
          d="M27.0005 3.00003H5.00049C4.47006 3.00003 3.96135 3.21074 3.58627 3.58582C3.2112 3.96089 3.00049 4.4696 3.00049 5.00003V27C3.00049 27.5305 3.2112 28.0392 3.58627 28.4142C3.96135 28.7893 4.47006 29 5.00049 29H27.0005C27.5309 29 28.0396 28.7893 28.4147 28.4142C28.7898 28.0392 29.0005 27.5305 29.0005 27V5.00003C29.0005 4.4696 28.7898 3.96089 28.4147 3.58582C28.0396 3.21074 27.5309 3.00003 27.0005 3.00003ZM27.0005 5.00003V9.00003H5.00049V5.00003H27.0005ZM17.0005 11H27.0005V18H17.0005V11ZM15.0005 18H5.00049V11H15.0005V18ZM5.00049 20H15.0005V27H5.00049V20ZM17.0005 27V20H27.0005V27H17.0005Z"
          fill="currentColor"
        />
      </svg>
      <span>Budget ranges</span>
    </button>
  );
};

export default BudgetRanges;
