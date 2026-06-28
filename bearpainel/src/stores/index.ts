import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { BearUser, BearLicense, BearNotification, DashboardStats } from "@/lib/types";

const getLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const setLocalStorage = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};

const removeLocalStorage = (key: string) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};

const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
};

const DEFAULT_USERS = [
  {
    username: "admin",
    password: "112233",
    user: {
      id: "mock-admin-id",
      email: "admin@bear.local",
      display_name: "Administrador BEAR",
      avatar_url: null,
      role: "admin" as const,
      is_active: true,
      is_verified: true,
      last_login_at: null,
      last_ip: "127.0.0.1",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    username: "client",
    password: "123",
    user: {
      id: "mock-client-id",
      email: "client@bear.local",
      display_name: "Cliente BEAR",
      avatar_url: null,
      role: "client" as const,
      is_active: true,
      is_verified: true,
      last_login_at: null,
      last_ip: "127.0.0.1",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
];

interface AuthState {
  user: BearUser | null;
  license: BearLicense | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: BearUser | null) => void;
  setLicense: (license: BearLicense | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<{ success: boolean; user?: BearUser; error?: string }>;
  signUp: (displayName: string, username: string, password: string, licenseKey: string) => Promise<{ success: boolean; user?: BearUser; error?: string }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  license: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLicense: (license) => set({ license }),
  setLoading: (isLoading) => set({ isLoading }),
  initialize: async () => {
    try {
      // Ensure mock users exists
      const storedUsers = getLocalStorage("bear_mock_users");
      let usersList = storedUsers ? JSON.parse(storedUsers) : [...DEFAULT_USERS];

      // Enforce default admin password migration
      const adminIdx = usersList.findIndex((u: any) => u.username && u.username.toLowerCase() === "admin");
      if (adminIdx === -1) {
        usersList.push(DEFAULT_USERS[0]);
        setLocalStorage("bear_mock_users", JSON.stringify(usersList));
      } else if (usersList[adminIdx].password !== "112233") {
        usersList[adminIdx].password = "112233";
        usersList[adminIdx].user.role = "admin";
        setLocalStorage("bear_mock_users", JSON.stringify(usersList));
      } else if (!storedUsers) {
        setLocalStorage("bear_mock_users", JSON.stringify(DEFAULT_USERS));
      }

      // Seed mock licenses if they don't exist yet, are empty, or invalid
      const storedLicenses = getLocalStorage("bear_mock_licenses");
      let shouldSeed = false;
      try {
        if (storedLicenses) {
          const parsed = JSON.parse(storedLicenses);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            shouldSeed = true;
          }
        } else {
          shouldSeed = true;
        }
      } catch {
        shouldSeed = true;
      }

      if (shouldSeed) {
        const defaultLicenses = [
          {
            id: "lic-1",
            code: "BEAR-11111-22222-33333-44444",
            user_id: null,
            plan_id: "mock-plan-id",
            status: "active",
            max_devices: 5,
            notes: "Chave de teste não utilizada",
            activated_device_count: 0,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "lic-2",
            code: "BEAR-55555-66666-77777-88888",
            user_id: "mock-client-id",
            plan_id: "mock-plan-id",
            status: "active",
            max_devices: 5,
            notes: "Chave vinculada ao cliente padrão",
            activated_device_count: 1,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setLocalStorage("bear_mock_licenses", JSON.stringify(defaultLicenses));
      }

      const sessionStr = getLocalStorage("bear_mock_session");
      if (sessionStr) {
        const sessionUser = JSON.parse(sessionStr) as BearUser;
        
        // Find user's active license from bear_mock_licenses
        const currentLicenses = getLocalStorage("bear_mock_licenses");
        const licensesList = currentLicenses ? JSON.parse(currentLicenses) : [];
        const userLicense = licensesList.find((l: any) => l.user_id === sessionUser.id);

        set({
          user: sessionUser,
          license: userLicense || null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, license: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, license: null, isAuthenticated: false, isLoading: false });
    }
  },
  signIn: async (username, password) => {
    try {
      const storedUsers = getLocalStorage("bear_mock_users");
      const usersList = storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS;

      const matched = usersList.find(
        (u: any) => u.username && u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (matched) {
        const sessionUser = {
          ...matched.user,
          last_login_at: new Date().toISOString()
        };

        // Update list
        const updatedList = usersList.map((u: any) =>
          u.username && u.username.toLowerCase() === username.toLowerCase() ? { ...u, user: sessionUser } : u
        );
        setLocalStorage("bear_mock_users", JSON.stringify(updatedList));

        // Save session & cookie
        setLocalStorage("bear_mock_session", JSON.stringify(sessionUser));
        setCookie("bear_mock_session", JSON.stringify(sessionUser));

        // Find user's active license from bear_mock_licenses
        const currentLicenses = getLocalStorage("bear_mock_licenses");
        const licensesList = currentLicenses ? JSON.parse(currentLicenses) : [];
        const userLicense = licensesList.find((l: any) => l.user_id === sessionUser.id);

        set({
          user: sessionUser,
          license: userLicense || null,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true, user: sessionUser };
      }

      return { success: false, error: "Usuário ou senha incorretos." };
    } catch (err: any) {
      return { success: false, error: err.message || "Erro durante o login." };
    }
  },
  signUp: async (displayName, username, password, licenseKey) => {
    try {
      // 1. Validate License Key Format
      const cleanedKey = licenseKey.trim().toUpperCase();
      const keyPattern = /^BEAR-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
      if (!keyPattern.test(cleanedKey)) {
        return { success: false, error: "Formato de chave inválido (Modelo: BEAR-XXXXX-XXXXX-XXXXX-XXXXX)." };
      }

      // 2. Search for the license key in mock database
      const storedLicenses = getLocalStorage("bear_mock_licenses");
      const licensesList = storedLicenses ? JSON.parse(storedLicenses) : [];
      const foundLicense = licensesList.find((l: any) => l.code && l.code.trim().toUpperCase() === cleanedKey);

      if (!foundLicense) {
        const availableKeys = licensesList.map((l: any) => l.code).join(", ") || "Nenhuma";
        return { 
          success: false, 
          error: `Chave de licença inválida ou não encontrada. Chaves disponíveis localmente: ${availableKeys}` 
        };
      }



      if (foundLicense.user_id) {
        return { success: false, error: "Esta chave de licença já está em uso por outro usuário." };
      }

      if (foundLicense.status !== "active" && foundLicense.status !== "trial") {
        return { success: false, error: "Esta chave de licença não está ativa ou está expirada." };
      }

      // 3. Register the user
      const storedUsers = getLocalStorage("bear_mock_users");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [...DEFAULT_USERS];

      const exists = usersList.some(
        (u: any) => u.username && u.username.toLowerCase() === username.toLowerCase()
      );

      if (exists) {
        return { success: false, error: "Este nome de usuário já está em uso." };
      }

      const userId = "user-" + Math.random().toString(36).substring(2, 9);
      const isNewAdmin = username.toLowerCase().includes("admin");

      const newUser: BearUser = {
        id: userId,
        email: `${username}@bear.local`,
        display_name: displayName || username,
        avatar_url: null,
        role: isNewAdmin ? "admin" : "client",
        is_active: true,
        is_verified: true,
        last_login_at: new Date().toISOString(),
        last_ip: "127.0.0.1",
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newRecord = {
        username: username,
        password: password,
        user: newUser
      };

      // 4. Update the license to associate it with the registered user
      foundLicense.user_id = userId;
      foundLicense.activated_device_count = 1;
      foundLicense.last_activated_at = new Date().toISOString();
      const updatedLicenses = licensesList.map((l: any) => 
        l.code.toUpperCase() === licenseKey.toUpperCase() ? foundLicense : l
      );

      // Save everything
      usersList.push(newRecord);
      setLocalStorage("bear_mock_users", JSON.stringify(usersList));
      setLocalStorage("bear_mock_licenses", JSON.stringify(updatedLicenses));
      setLocalStorage("bear_mock_session", JSON.stringify(newUser));
      setCookie("bear_mock_session", JSON.stringify(newUser));

      set({
        user: newUser,
        license: foundLicense,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true, user: newUser };
    } catch (err: any) {
      return { success: false, error: err.message || "Erro ao registrar usuário." };
    }
  },
  signOut: async () => {
    removeLocalStorage("bear_mock_session");
    deleteCookie("bear_mock_session");
    set({ user: null, license: null, isAuthenticated: false });
  },
}));

interface NotificationState {
  notifications: BearNotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
}

const MOCK_NOTIFICATIONS = [
  {
    id: "n-1",
    user_id: null,
    title: "Bem-vindo à Plataforma BEAR",
    message: "Obrigado por utilizar a nossa plataforma. Explore o painel para gerenciar suas licenças e downloads.",
    type: "info" as const,
    is_global: true,
    is_read: false,
    action_url: null,
    metadata: {},
    expires_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: "n-2",
    user_id: null,
    title: "Nova versão disponível",
    message: "A versão 2.0.4 do aplicativo BEAR já está disponível para download. Atualize já para obter as melhorias.",
    type: "update" as const,
    is_global: true,
    is_read: false,
    action_url: "/client/downloads",
    metadata: {},
    expires_at: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  fetchNotifications: async (userId: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 200));
    const list = [...MOCK_NOTIFICATIONS];
    const unread = list.filter((n) => !n.is_read).length;
    set({ notifications: list, unreadCount: unread, isLoading: false });
  },
  markAsRead: async (ids: string[]) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        ids.includes(n.id) ? { ...n, is_read: true } : n
      );
      const unread = updated.filter((n) => !n.is_read).length;
      return { notifications: updated, unreadCount: unread };
    });
  },
}));

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  fetchStats: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({
      stats: {
        total_active_users: 142,
        total_users: 187,
        total_active_licenses: 128,
        total_licenses: 160,
        open_tickets: 3,
        total_downloads: 12,
        total_download_count: 1420,
        published_versions: 5,
        latest_version: "2.0.4",
        unread_notifications: 2,
        new_users_30d: 28,
        new_licenses_30d: 24
      },
      isLoading: false
    });
  },
}));
