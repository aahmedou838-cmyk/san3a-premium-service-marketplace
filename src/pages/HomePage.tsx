// Home page of the app, Currently a demo page for demonstration.
// Please rewrite this file to implement your own logic. Do not replace or delete it, simply rewrite this HomePage.tsx file.
import { useEffect, useState, useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Toaster, toast } from '@/components/ui/sonner'

// Convex Auth block
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInForm } from "../components/SignInForm";
import { SignOutButton } from "../components/SignOutButton";
import { TemplateDemo, HAS_TEMPLATE_DEMO } from '@/components/TemplateDemo';

//import { useQuery, useMutation } from 'convex/react';
//import { api } from '@convex/_generated/api';

// Timer store: independent slice with a clear, minimal API, for demonstration
function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function HomePage() {
  // Select only what is needed to avoid unnecessary re-renders
  const [coins, setCoins] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    if (!isRunning || startedAt === null) return

    const t = setInterval(() => {
      setElapsedMs(Date.now() - startedAt)
    }, 250)

    return () => clearInterval(t)
  }, [isRunning, startedAt])

  const formatted = useMemo(() => formatDuration(elapsedMs), [elapsedMs])

  const onPleaseWait = () => {
    setCoins((c) => c + 1)

    if (!isRunning) {
      // Resume from the current elapsed time
      setStartedAt(Date.now() - elapsedMs)
      setIsRunning(true)
      toast.success('Building your app…', {
        description: "Hang tight, we're setting everything up.",
      })
      return
    } 

      setIsRunning(false)
      toast.info('Taking a short pause', {
        description: 'We\'ll continue shortly.',
      })
  }

  const onReset = () => {
    setCoins(0)
    setIsRunning(false)
    setStartedAt(null)
    setElapsedMs(0)
    toast('Reset complete')
  }

  const onAddCoin = () => {
    setCoins((c) => c + 1)
    toast('Coin added')
  }

  const loggedInUser = useQuery(api.auth.loggedInUser)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden relative">
        <ThemeToggle />
        <SignOutButton />
        <div className="absolute inset-0 bg-gradient-rainbow opacity-10 dark:opacity-20 pointer-events-none" />
        <div className="text-center space-y-8 relative z-10 animate-fade-in w-full">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-primary floating">
              <Sparkles className="w-8 h-8 text-white rotating" />
            </div>
          </div>
          <Authenticated>
            <p className="text-xl text-secondary">
              Welcome back, {loggedInUser?.email ?? "friend"}!
            </p>
          </Authenticated>
          <Unauthenticated>
            <p className="text-xl text-secondary">Sign in to get started</p>
          </Unauthenticated>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
            Creating your <span className="text-gradient">app</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
            Your application would be ready soon.
          </p>
          {HAS_TEMPLATE_DEMO ? (
            <div className="max-w-5xl mx-auto text-left">
              <TemplateDemo />
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-4">
                <Button 
                  size="lg"
                  onClick={onPleaseWait}
                  className="btn-gradient px-8 py-4 text-lg font-semibold hover:-translate-y-0.5 transition-all duration-200"
                  aria-live="polite"
                >
                  Please Wait
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div>
                  Time elapsed: <span className="font-medium tabular-nums text-foreground">{formatted}</span>
                </div>
                <div>
                  Coins: <span className="font-medium tabular-nums text-foreground">{coins}</span>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={onReset}>
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={onAddCoin}>
                  Add Coin
                </Button>
              </div>
            </>
          )}
        </div>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
        <footer className="absolute bottom-8 text-center text-muted-foreground/80">
          <p>Built with love at Andromo</p>
        </footer>
        <Toaster richColors closeButton />
      </div>
  )
}
