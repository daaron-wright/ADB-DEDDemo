import { useMemo } from 'react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PortalProfileMenuProps {
  name: string;
  email: string;
  avatarUrl: string;
  status?: 'online' | 'offline' | 'none';
  onSignOut?: () => void;
}

const statusStyles: Record<Exclude<PortalProfileMenuProps['status'], undefined>, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  none: 'hidden',
};

export function PortalProfileMenu({
  name,
  email,
  avatarUrl,
  status = 'none',
  onSignOut,
}: PortalProfileMenuProps) {
  const initials = useMemo(() => {
    const segments = name.trim().split(' ');
    return segments
      .slice(0, 2)
      .map((segment) => segment.charAt(0).toUpperCase())
      .join('');
  }, [name]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group inline-flex items-center gap-3 rounded-full border border-[#d8e4df] bg-[#f9fbfa] px-3 py-1.5 text-left shadow-[0_8px_24px_-20px_rgba(11,64,55,0.18)] transition hover:bg-[#eaf7f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30">
        <span className="relative flex items-center gap-2">
          <Avatar className="h-9 w-9 rounded-xl">
            <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
            <AvatarFallback className="rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-600">
              {initials || 'NA'}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white ${statusStyles[status]}`}
          />
        </span>
        <span className="flex flex-col items-start">
          <span className="text-sm font-semibold text-neutral-900">{name}</span>
          <span className="text-xs text-neutral-500">{email}</span>
        </span>
        <ChevronDown className="ml-1 h-4 w-4 shrink-0 text-neutral-400 transition group-hover:text-neutral-600" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border border-neutral-100 bg-white shadow-[0_20px_40px_-24px_rgba(15,23,42,0.28)]">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.18em] text-neutral-500">Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-100" />
        <DropdownMenuItem className="rounded-lg text-neutral-700 hover:bg-neutral-100">
          <User className="h-4 w-4 text-neutral-500" />
          View profile
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg text-neutral-700 hover:bg-neutral-100">
          <Settings className="h-4 w-4 text-neutral-500" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-100" />
        <DropdownMenuItem
          className="rounded-lg text-rose-600 hover:bg-rose-50"
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
