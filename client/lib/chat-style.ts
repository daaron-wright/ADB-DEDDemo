import type { ClassValue } from "clsx";

import { cn } from "@/lib/utils";

export const CHAT_CARD_RADIUS_CLASS = "rounded-3xl";

export const chatCardClass = (...classes: ClassValue[]) =>
  cn(CHAT_CARD_RADIUS_CLASS, ...classes);
