// ========================================================
// BEAR Platform - TypeScript Types
// ========================================================

// Enums
export type LicenseStatus = "active" | "suspended" | "expired" | "revoked" | "trial";
export type PlanType = "free" | "basic" | "standard" | "premium" | "enterprise";
export type UserRole = "admin" | "moderator" | "support" | "client";
export type TicketStatus = "open" | "in_progress" | "waiting_client" | "waiting_support" | "resolved" | "closed";
export type NotificationType = "info" | "warning" | "update" | "maintenance" | "promotion";
export type LogAction = "login" | "logout" | "failure" | "change" | "update" | "license" | "config" | "ticket" | "download";

// Core Entities
export interface BearUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: string | null;
  last_ip: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  bear_profiles?: BearProfile;
}

export interface BearProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  timezone: string;
  language: string;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface BearPlan {
  id: string;
  name: string;
  type: PlanType;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  max_devices: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BearLicense {
  id: string;
  code: string;
  user_id: string | null;
  plan_id: string;
  status: LicenseStatus;
  max_devices: number;
  notes: string | null;
  last_activated_at: string | null;
  activated_device_count: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  bear_plans?: BearPlan;
  bear_users?: BearUser;
}

export interface BearVersion {
  id: string;
  version: string;
  version_code: number;
  title: string | null;
  description: string | null;
  changelog: string | null;
  download_url: string | null;
  file_size: number;
  file_hash: string | null;
  min_os_version: string | null;
  is_mandatory: boolean;
  is_published: boolean;
  published_at: string | null;
  published_by: string | null;
  min_plan: PlanType;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BearDownload {
  id: string;
  version_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number;
  file_hash: string | null;
  mime_type: string | null;
  download_count: number;
  is_active: boolean;
  min_plan: PlanType;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  bear_versions?: BearVersion;
}

export interface BearTicket {
  id: string;
  ticket_number: number;
  user_id: string;
  assigned_to: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: string;
  category: string | null;
  tags: string[];
  is_read_by_admin: boolean;
  is_read_by_client: boolean;
  closed_at: string | null;
  closed_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  bear_users?: BearUser;
}

export interface BearTicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  attachments: string[];
  is_internal: boolean;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  bear_users?: BearUser;
}

export interface BearNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_global: boolean;
  is_read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown>;
  expires_at: string | null;
  created_at: string;
}

export interface BearFeatureFlag {
  id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  required_plan: PlanType;
  min_version: string | null;
  max_version: string | null;
  target_percentage: number;
  conditions: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BearRemoteConfig {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  category: string;
  is_active: boolean;
  target_plans: PlanType[];
  min_version: string | null;
  max_version: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BearActivityLog {
  id: string;
  user_id: string | null;
  action: LogAction;
  resource_type: string | null;
  resource_id: string | null;
  description: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  bear_users?: BearUser;
}

export interface BearDevice {
  id: string;
  user_id: string;
  license_id: string | null;
  device_name: string | null;
  device_type: string | null;
  os_name: string | null;
  os_version: string | null;
  hardware_id: string | null;
  is_active: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface BearAnnouncement {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  target_plans: PlanType[];
  target_roles: UserRole[];
  banner_url: string | null;
  action_url: string | null;
  is_active: boolean;
  priority: number;
  starts_at: string;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard View
export interface DashboardStats {
  total_active_users: number;
  total_users: number;
  total_active_licenses: number;
  total_licenses: number;
  open_tickets: number;
  total_downloads: number;
  total_download_count: number;
  published_versions: number;
  latest_version: string | null;
  unread_notifications: number;
  new_users_30d: number;
  new_licenses_30d: number;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filters
export interface FilterParams {
  search?: string;
  status?: string;
  role?: string;
  plan?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
