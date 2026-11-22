import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(val: number): string {
  if (isNaN(val)) return "0.00";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = dayjs(dateStr);
  if (!d.isValid()) return dateStr;
  return d.format("DD-MMM-YY");
}

export function getTodayFormatted(): string {
  return dayjs().format("YYYY-MM-DD");
}
