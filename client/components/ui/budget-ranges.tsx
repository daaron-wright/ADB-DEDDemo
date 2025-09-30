import React from "react";

interface BudgetRangesProps {
  className?: string;
}

const BudgetRanges: React.FC<BudgetRangesProps> = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ${className}`}>
      {/* Table/Grid Icon */}
      <div className="flex h-8 w-8 items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
        >
          <path
            d="M27.0005 3.00003H5.00049C4.47006 3.00003 3.96135 3.21074 3.58627 3.58582C3.2112 3.96089 3.00049 4.4696 3.00049 5.00003V27C3.00049 27.5305 3.2112 28.0392 3.58627 28.4142C3.96135 28.7893 4.47006 29 5.00049 29H27.0005C27.5309 29 28.0396 28.7893 28.4147 28.4142C28.7898 28.0392 29.0005 27.5305 29.0005 27V5.00003C29.0005 4.4696 28.7898 3.96089 28.4147 3.58582C28.0396 3.21074 27.5309 3.00003 27.0005 3.00003ZM27.0005 5.00003V9.00003H5.00049V5.00003H27.0005ZM17.0005 11H27.0005V18H17.0005V11ZM15.0005 18H5.00049V11H15.0005V18ZM5.00049 20H15.0005V27H5.00049V20ZM17.0005 27V20H27.0005V27H17.0005Z"
            fill="#169F9F"
          />
        </svg>
      </div>

      {/* Text */}
      <span className="text-sm font-semibold text-slate-900">Budget ranges</span>
    </div>
  );
};

export default BudgetRanges;
