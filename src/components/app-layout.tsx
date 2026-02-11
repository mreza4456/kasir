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
    SidebarTrigger,
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
    Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/actions/user"
import React from "react"
import { Button } from "./ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet"

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

// Mobile Navigation Component
function MobileNav({ pathname, onLogout, isLoggingOut }: {
    pathname: string | null
    onLogout: () => void
    isLoggingOut: boolean
}) {
    const [open, setOpen] = React.useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <div className="flex w-full bg-secondary justify-between fixed top-0 left-0 z-40 h-13 items-center px-4 lg:hidden">

                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden  top-4 left-4 z-50 "
                    >
                        <Menu className="h-15 w-15" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    <img src="/logo-horizontal.png" alt="Logo" className="ml-2 h-8 w-auto" />
                </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <SheetHeader className="border-b px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Package className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col text-left">
                                <SheetTitle className="text-sm font-semibold">Admin Panel</SheetTitle>
                                <span className="text-xs text-muted-foreground">Management System</span>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto py-4">
                        {menuItems.map((section) => (
                            <div key={section.title} className="px-3 mb-4">
                                <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.url
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.url}
                                                onClick={() => setOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                    isActive
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                )}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.name}</span>
                                                {isActive && (
                                                    <ChevronRight className="ml-auto h-4 w-4" />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Logout */}
                    <div className="border-t p-4">
                        <button
                            onClick={() => {
                                onLogout()
                                setOpen(false)
                            }}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoggingOut ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="h-4 w-4" />
                            )}
                            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

// Desktop Sidebar Component
function DesktopSidebar({ pathname, onLogout, isLoggingOut }: {
    pathname: string | null
    onLogout: () => void
    isLoggingOut: boolean
}) {
    return (
        <Sidebar className="hidden lg:flex">
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
                                onClick={onLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                            >
                                {isLoggingOut ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <LogOut className="h-4 w-4" />
                                )}
                                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

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
            <>
                {/* Mobile Navigation */}
                <MobileNav
                    pathname={pathname}
                    onLogout={handleLogout}
                    isLoggingOut={isLoggingOut}
                />

                {/* Desktop Layout */}
                <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                        <DesktopSidebar
                            pathname={pathname}
                            onLogout={handleLogout}
                            isLoggingOut={isLoggingOut}
                        />

                        <main className="flex-1 w-full lg:w-auto">
                            {/* Mobile Header Spacer */}
                            <div className="h-16 lg:hidden" />

                            {/* Content */}
                            <div className="container mx-auto p-4 md:p-6">
                               
                                {children}
                            </div>
                        </main>
                    </div>
                </SidebarProvider>
            </>
        )
    }

    return <>{children}</>
}