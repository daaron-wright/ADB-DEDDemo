import { useMemo } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PortalProfileMenuProps {
  name: string;
  email: string;
  avatarUrl: string;
  status?: "online" | "offline" | "none";
  onSignOut?: () => void;
}

const statusStyles: Record<
  Exclude<PortalProfileMenuProps["status"], undefined>,
  string
> = {
  online: "bg-[#0f766e]",
  offline: "bg-[#a6bbb1]",
  none: "hidden",
};

export function PortalProfileMenu({
  name,
  email,
  avatarUrl,
  status = "none",
  onSignOut,
}: PortalProfileMenuProps) {
  const initials = useMemo(() => {
    const segments = name.trim().split(" ");
    return segments
      .slice(0, 2)
      .map((segment) => segment.charAt(0).toUpperCase())
      .join("");
  }, [name]);
  const sanitizedAvatarUrl = avatarUrl.trim();
  const hasAvatarImage = sanitizedAvatarUrl.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group inline-flex items-center gap-3 rounded-full border border-[#d4e4df] bg-white px-4 py-2 text-left shadow-[0_8px_24px_-20px_rgba(7,32,28,0.18)] transition hover:shadow-[0_12px_24px_-20px_rgba(7,32,28,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30">
        <span className="relative flex items-center">
          <Avatar className="h-10 w-10 rounded-full shadow-[0_4px_12px_-6px_rgba(7,32,28,0.35)]">
            {hasAvatarImage ? (
              <AvatarImage
                src={sanitizedAvatarUrl}
                alt={name}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="flex items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
              {hasAvatarImage ? (
                initials || "NA"
              ) : (
                <User className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              )}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white ${statusStyles[status]}`}
          />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-slate-900">{name}</span>
          <span className="text-xs font-medium text-[#6c7a74]">{email}</span>
        </span>
        <ChevronDown className="ml-1 h-4 w-4 shrink-0 text-[#7a8a85] transition group-hover:text-[#0f766e]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl border border-[#d8e4df] bg-white shadow-[0_20px_40px_-28px_rgba(11,64,55,0.2)]"
      >
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.18em] text-[#0f766e]">
          Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#d8e4df]" />
        <DropdownMenuItem className="rounded-lg text-slate-700 hover:bg-[#eaf7f3]">
          <User className="h-4 w-4 text-neutral-500" />
          View profile
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg text-slate-700 hover:bg-[#eaf7f3]">
          <Settings className="h-4 w-4 text-neutral-500" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#d8e4df]" />
        <DropdownMenuItem
          className="rounded-lg text-[#b23b31] hover:bg-[#fdf1f0]"
          onSelect={(event) => {
            event.preventDefault();
            onSignOut?.();
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
