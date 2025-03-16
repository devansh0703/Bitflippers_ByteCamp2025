"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  X,
  LogOut,
  User,
  BarChart2,
  FileText,
  Award,
  ShieldAlert,
} from "lucide-react"
import "./globals.css"

export default function ClientLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/login"
  }

  const navLinks = [
    { href: "/", label: "Home", icon: <BarChart2 className="w-4 h-4 mr-2" /> },
    { href: "/dashboard", label: "Dashboard", icon: <User className="w-4 h-4 mr-2" /> },
    { href: "/submissions", label: "Submissions", icon: <FileText className="w-4 h-4 mr-2" /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <Award className="w-4 h-4 mr-2" /> },
  ]

  // Only add the Moderator link if the logged-in user is a moderator.
  if (user?.role === "moderator") {
    navLinks.push({
      href: "/moderator",
      label: "Moderator",
      icon: <ShieldAlert className="w-4 h-4 mr-2" />,
    })
  }

  return (
    <html lang="en">
      <head>
        <title>Smart Circular Cities | Mumbai</title>
        <meta
          name="description"
          content="Empowering Mumbai's citizens to address waste management, flood control, and energy poverty"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <ThemeProvider attribute="class" defaultTheme="light">
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
                    <div className="absolute inset-0 flex items-center justify-center text-primary-foreground font-bold">
                      SC
                    </div>
                  </div>
                  <span className="hidden font-bold sm:inline-block">
                    Smart Circular Cities
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="default" size="sm">
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </nav>

              {/* Mobile Navigation Toggle */}
              <Button
                variant="ghost"
                className="md:hidden"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
              <div className="md:hidden container py-4 border-t">
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                  {user ? (
                    <Button
                      variant="ghost"
                      className="justify-start px-0"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  ) : (
                    <Button asChild variant="default" size="sm" className="w-full">
                      <Link href="/login">Login</Link>
                    </Button>
                  )}
                </nav>
              </div>
            )}
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t bg-muted/40">
            <div className="container py-8 md:py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Smart Circular Cities</h3>
                  <p className="text-sm text-muted-foreground">
                    Empowering Mumbai's citizens to address waste management, flood control, and energy poverty through
                    community participation.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm">
                    {navLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-muted-foreground hover:text-primary">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact</h3>
                  <p className="text-sm text-muted-foreground">
                    Mumbai, Maharashtra, India
                    <br />
                    info@smartcircularcities.org
                  </p>
                </div>
              </div>
              <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Smart Circular Cities. All rights reserved.
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}

