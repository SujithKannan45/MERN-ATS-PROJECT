import * as React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, Code } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Banner / Announcement */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-1.5 text-center text-xs font-medium text-primary">
        🚀 Powered by Google Gemini AI & Intelligent Resume Parsing. Supercharge your job search.
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              ResumeATS<span className="text-primary font-black">.ai</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it Works
            </a>
            <a href="#preview" className="transition-colors hover:text-foreground">
              ATS Analysis
            </a>
            <a href="#pipeline" className="transition-colors hover:text-foreground">
              Job Tracker
            </a>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="default" size="sm" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="gap-2 shadow-sm">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted focus:outline-none"
              aria-label="Toggle mobile navigation"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background p-4 space-y-3">
            <nav className="flex flex-col space-y-3 text-sm font-medium">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-muted-foreground hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-muted-foreground hover:text-foreground"
              >
                How it Works
              </a>
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-muted-foreground hover:text-foreground"
              >
                ATS Analysis
              </a>
            </nav>
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 text-sm text-muted-foreground">
        <div className="container px-4 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              ResumeATS.ai
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enterprise-grade AI-powered ATS resume builder, optimization scanner, and job
              application tracker for modern professionals.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-foreground">Resume Analyzer</a></li>
              <li><a href="#pipeline" className="hover:text-foreground">Job Pipeline</a></li>
              <li><a href="#preview" className="hover:text-foreground">AI Optimization</a></li>
              <li><Link to="/docs" className="hover:text-foreground">Swagger API Docs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-foreground">Candidate Portal</Link></li>
              <li><Link to="/register" className="hover:text-foreground">Create Account</Link></li>
              <li><a href="#security" className="hover:text-foreground">Security & Privacy</a></li>
              <li><a href="#status" className="hover:text-foreground">System Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Community</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <a
                  href="https://github.com/SujithKannan45/MERN-ATS-PROJECT"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <span className="text-xs text-muted-foreground">Version 1.0.0 Production</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ResumeATS.ai Platform. Built with React, TypeScript, Node.js, Express & Google Gemini.
        </div>
      </footer>
    </div>
  );
}
