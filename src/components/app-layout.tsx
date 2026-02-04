"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarHeader,
    SidebarFooter,
} from "./ui/sidebar"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    BookOpenTextIcon,
    Banknote,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/actions/user"
import React from "react"

const menuItems = [
    {
        title: "Menu Utama",
        items: [
            {
                url: '/admin/',
                name: 'Dashboard',
                icon: LayoutDashboard,
            },
            {
                url: '/admin/products',
                name: 'Produk',
                icon: Package,
            },
            {
                url: '/admin/transaction',
                name: 'Transaksi',
                icon: Banknote,
            },
        ]
    },
    {
        title: "Pengaturan",
        items: [
            {
                url: '/admin/categories',
                name: 'Kategori',
                icon: Settings,
            },
            {
                url: '/admin/user',
                name: 'User',
                icon: Users,
            },
        ]
    }
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdminLayout = pathname?.startsWith("/admin") && pathname !== "/admin/"
    const [isLoggingOut, setIsLoggingOut] = React.useState(false)
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await logoutAction()
        } catch (error) {
            console.error("Error logging out:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }


    if (isAdminLayout) {
        return (
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <Sidebar>
                        <SidebarHeader className="border-b px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Package className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Admin Panel</span>
                                    <span className="text-xs text-muted-foreground">Management System</span>
                                </div>
                            </div>
                        </SidebarHeader>

                        <SidebarContent>
                            {menuItems.map((section) => (
                                <SidebarGroup key={section.title}>
                                    <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {section.items.map((item) => {
                                                const isActive = pathname === item.url
                                                return (
                                                    <SidebarMenuItem key={item.name}>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={isActive}
                                                            tooltip={item.name}
                                                        >
                                                            <Link href={item.url}>
                                                                <item.icon className="h-4 w-4" />
                                                                <span>{item.name}</span>
                                                                {isActive && (
                                                                    <ChevronRight className="ml-auto h-4 w-4" />
                                                                )}
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                )
                                            })}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            ))}
                        </SidebarContent>

                        <SidebarFooter className="border-t p-4">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <button
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            {isLoggingOut ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <LogOut className="w-4 h-4" />
                                            )}
                                            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
                    </Sidebar>

                    <main className="flex-1 overflow-y-auto">
                        <div className="container mx-auto p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        )
    }

    return <>{children}</>
}