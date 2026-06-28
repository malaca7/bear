import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, format: "short" | "long" | "relative" = "short"): string {
  const d = new Date(date);
  const now = new Date();

  if (format === "relative") {
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 30) return `${days}d atrás`;
    return d.toLocaleDateString("pt-BR");
  }

  if (format === "long") {
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString("pt-BR");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function generateLicenseCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `BEAR-${segment()}-${segment()}-${segment()}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "text-bear-success",
    suspended: "text-bear-warning",
    expired: "text-bear-danger",
    revoked: "text-bear-danger",
    trial: "text-bear-info",
    open: "text-bear-info",
    in_progress: "text-bear-warning",
    resolved: "text-bear-success",
    closed: "text-bear-muted",
  };
  return colors[status] || "text-bear-muted";
}

export function getStatusBadgeClasses(status: string): string {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variants: Record<string, string> = {
    active: `${base} bg-green-500/10 text-green-400 border border-green-500/20`,
    suspended: `${base} bg-yellow-500/10 text-yellow-400 border border-yellow-500/20`,
    expired: `${base} bg-red-500/10 text-red-400 border border-red-500/20`,
    revoked: `${base} bg-red-500/10 text-red-400 border border-red-500/20`,
    trial: `${base} bg-blue-500/10 text-blue-400 border border-blue-500/20`,
    open: `${base} bg-blue-500/10 text-blue-400 border border-blue-500/20`,
    in_progress: `${base} bg-yellow-500/10 text-yellow-400 border border-yellow-500/20`,
    resolved: `${base} bg-green-500/10 text-green-400 border border-green-500/20`,
    closed: `${base} bg-gray-500/10 text-gray-400 border border-gray-500/20`,
  };
  return variants[status] || `${base} bg-gray-500/10 text-gray-400 border border-gray-500/20`;
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}
