"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  FileCheck,
  Briefcase,
  Shield,
  CheckCircle,
  Scale,
  Users,
} from "lucide-react";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Stats {
  conversations: number;
  consultations: number;
  documents: number;
  billingDate: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        setUser(session.user as User);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/login");
      }
    };

    checkAuth();

    // Check screen size for mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const userTier: string = "Grow"; // Placeholder - would be fetched from user subscription data
  const isFreeTier = userTier === "Explore";

  const stats: Stats = {
    conversations: 0,
    consultations: userTier === "Build" ? 0 : userTier === "Grow" ? 1 : userTier === "Lead" ? 2 : 0,
    documents: 0,
    billingDate: "May 9, 2026",
  };

  const quickActions = [
    { icon: FileCheck, label: "Review a Contract", color: "text-blue-400" },
    { icon: Briefcase, label: "Form a Business", color: "text-purple-400" },
    { icon: Shield, label: "Protect My IP", color: "text-green-400" },
    { icon: CheckCircle, label: "Check Compliance", color: "text-amber-400" },
    { icon: Scale, label: "Employment Law", color: "text-red-400" },
    { icon: Users, label: "Book Attorney", color: "text-pink-400" },
  ];

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: MessageSquare, label: "Chat with Allora", href: "/chat" },
    { icon: FileText, label: "Documents", href: "/documents" },
    { icon: Calendar, label: "Schedule", href: "/schedule" },
    { icon: User, label: "My Account", href: "/account" },
  ];

  return (
    <div className="h-screen bg-[#0f0f14] flex">
      {/* Sidebar */}
      <div
        className={`fixed md:relative z-40 h-screen bg-white/[0.02] border-r border-white/[0.08] transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 md:w-64"
        } ${isMobile && !sidebarOpen ? "hidden" : ""}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.08]">
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
              className="p-1 hover:bg-white/[0.08] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#a1a1aa]" />
            </button>
          )}
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.href === "/dashboard";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20"
                    : "text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white transition-all">
            <User className="w-5 h-5" />
            <span>Profile Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#a1a1aa] hover:bg-white/[0.04] hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-white/[0.08] flex items-center justify-between px-6 bg-white/[0.01]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-[#a1a1aa]" />
          </button>
          <h1 className="text-sm font-semibold text-[#a1a1aa]">Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f59e0b]/20 border border-[#f59e0b]/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-[#f59e0b]">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Greeting Section */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">Good morning, {userName}</h2>
              <p className="text-[#a1a1aa]">Your legal solutions are ready when you are.</p>
            </div>

            {/* Tier Indicator */}
            {isFreeTier && (
              <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-400">No Active Plan</p>
                  <p className="text-xs text-amber-400/80 mt-1">
                    Upgrade to Build, Grow, or Lead to unlock full features
                  </p>
                </div>
                <a
                  href="/#pricing"
                  className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                >
                  View Plans →
                </a>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#1a1a1f] to-[#0f0f14] border border-white/[0.08] rounded-lg p-6 hover:border-white/[0.12] transition-all">
                <p className="text-xs font-medium text-[#a1a1aa] mb-2">Allora Conversations</p>
                <p className="text-3xl font-bold text-white">{stats.conversations}</p>
              </div>

              <div className="bg-gradient-to-br from-[#1a1a1f] to-[#0f0f14] border border-white/[0.08] rounded-lg p-6 hover:border-white/[0.12] transition-all">
                <p className="text-xs font-medium text-[#a1a1aa] mb-2">
                  Consultations Remaining
                </p>
                <p className="text-3xl font-bold text-[#f59e0b]">{stats.consultations}</p>
              </div>

              <div className="bg-gradient-to-br from-[#1a1a1f] to-[#0f0f14] border border-white/[0.08] rounded-lg p-6 hover:border-white/[0.12] transition-all">
                <p className="text-xs font-medium text-[#a1a1aa] mb-2">Documents This Month</p>
                <p className="text-3xl font-bold text-white">{stats.documents}</p>
              </div>

              <div className="bg-gradient-to-br from-[#1a1a1f] to-[#0f0f14] border border-white/[0.08] rounded-lg p-6 hover:border-white/[0.12] transition-all">
                <p className="text-xs font-medium text-[#a1a1aa] mb-2">Next Billing Date</p>
                <p className="text-sm font-semibold text-white">{stats.billingDate}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      className="flex items-center gap-3 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f14] border border-white/[0.08] rounded-lg p-4 hover:border-[#f59e0b]/30 hover:bg-gradient-to-br hover:from-[#1a1a1f] hover:to-[#0f0f14] transition-all group"
                    >
                      <Icon className={`w-6 h-6 ${action.color} group-hover:text-[#f59e0b] transition-colors`} />
                      <span className="text-sm font-medium text-[#a1a1aa] group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="bg-gradient-to-br from-[#1a1a1f] to-[#0f0f14] border border-white/[0.08] rounded-lg p-6">
                <div className="text-center py-8">
                  <p className="text-[#a1a1aa] text-sm">No activity yet</p>
                  <p className="text-[#71717a] text-xs mt-1">
                    Start by chatting with Allora or scheduling a consultation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
