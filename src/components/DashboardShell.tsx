"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

interface UserData {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageSquare, label: "Chat with Allora", href: "/dashboard/chat" },
  { icon: FileText, label: "Documents", href: "/dashboard/documents" },
  { icon: Calendar, label: "Schedule", href: "/dashboard/schedule" },
  { icon: User, label: "My Account", href: "/dashboard/account" },
];

const adminItems = [
  { icon: ShieldCheck, label: "Review Queue", href: "/dashboard/review" },
];

export default function DashboardShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let currentUserId: string | null = null;

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        currentUserId = session.user.id;
        setUser(session.user as UserData);

        // Check role from members table
        const { data: member } = await supabase
          .from("members")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (member?.role === "admin" || member?.role === "attorney") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/login");
      }
    };

    checkAuth();

    // Hard-reset on any auth identity change. This prevents stale state from a
    // previous user from surviving a sign-out / sign-in cycle in the same tab,
    // which would otherwise look like an attorney-client confidentiality leak.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const nextUserId = session?.user?.id ?? null;

        if (event === "SIGNED_OUT" || !nextUserId) {
          // Wipe any in-memory state by doing a full reload to the login page
          if (typeof window !== "undefined") {
            window.location.replace("/login");
          }
          return;
        }

        if (currentUserId && nextUserId !== currentUserId) {
          // Different user signed in — force full reload so every child
          // component remounts with a clean slate
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }
      }
    );

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B5B4E]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="h-screen bg-[#FAF8F5] flex">
      {/* Sidebar */}
      <div
        className={`fixed md:relative z-40 h-screen bg-[#FFFFFF] border-r border-[#1F1810]/8 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 md:w-64"
        } ${isMobile && !sidebarOpen ? "hidden" : ""}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1F1810]/8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/logo-arrow.png"
              alt="Av{ai}lable Law"
              width={32}
              height={32}
              className="object-contain"
            />
          </Link>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-[#F5F0EB] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#6B5B4E]" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#C17832]/10 text-[#C17832] border border-[#C17832]/20"
                    : "text-[#6B5B4E] hover:bg-[#F5F0EB] hover:text-[#1F1810]"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-[#1F1810]/8">
              <p className="px-4 mb-2 text-[10px] font-semibold text-[#A89279] uppercase tracking-widest">
                Attorney
              </p>
              {adminItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#7A8B6F]/10 text-[#7A8B6F] border border-[#7A8B6F]/20"
                        : "text-[#6B5B4E] hover:bg-[#F5F0EB] hover:text-[#1F1810]"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-[#1F1810]/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6B5B4E] hover:bg-[#F5F0EB] hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="h-16 border-b border-[#1F1810]/8 flex items-center justify-between px-6 bg-[#FFFFFF]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-[#F5F0EB] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-[#6B5B4E]" />
          </button>
          <h1 className="text-sm font-semibold text-[#6B5B4E]">{title}</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C17832]/20 border border-[#C17832]/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-[#C17832]">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
        </div>
      </div>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
