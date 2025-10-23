"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Calendar,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Send,
  Settings,
  Users,
  Workflow,
  Shield, // ShieldCheck is not a valid lucide-react icon, using Shield instead
} from "lucide-react"
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase"
import { doc } from "firebase/firestore"
import { type User } from "@/lib/types"

import Icon from "@/app/icon"
import NavItem from "./nav-item"
import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!authUser) return null;
    return doc(firestore, "users", authUser.uid);
  }, [firestore, authUser]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<User>(userDocRef);
  
  useEffect(() => {
    if (!isAuthUserLoading && !authUser) {
      router.push("/login");
    }
  }, [isAuthUserLoading, authUser, router]);

  const handleLogout = () => {
    auth.signOut();
  };
  
  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      tourId: "dashboard-nav",
    },
    {
      href: "/calendar",
      icon: Calendar,
      label: "Calendário",
    },
    {
      href: "/patients",
      icon: Users,
      label: "Pacientes",
      tourId: "patients-nav",
    },
    {
      href: "/templates",
      icon: FileText,
      label: "Templates",
      tourId: "templates-nav",
    },
    {
      href: "/workflows",
      icon: Workflow,
      label: "Fluxos",
      tourId: "workflows-nav",
    },
    {
      href: "/outbox",
      icon: Send,
      label: "Caixa de Saída",
      tourId: "outbox-nav",
    },
    {
      href: "/consent-audit",
      icon: Shield,
      label: "Auditoria",
    }
  ]

  const isLoading = isAuthUserLoading || isUserDataLoading;

  if (isLoading || !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-16 items-center border-b px-6 shrink-0">
            <Link href="/dashboard">
              <Icon className="h-8 w-auto"/>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </nav>
          </div>
          <div className="p-4 border-t mt-auto shrink-0">
            <nav className="grid gap-1">
                <NavItem href="/settings" icon={Settings} label="Configurações" tourId="settings-nav" />
                <NavItem href="/support" icon={LifeBuoy} label="Suporte" />
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6 shrink-0">
          {/* Mobile Nav could be added here */}
          <div className="w-full flex-1" /> {/* Spacer */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={authUser?.photoURL || "https://picsum.photos/seed/user/100/100"} alt="@user" />
                  <AvatarFallback>{authUser?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>Configurações</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/support')}>Suporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
