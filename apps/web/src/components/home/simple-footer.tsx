'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function SimpleFooter() {
  const currentYear = new Date().getFullYear();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <footer className="w-full border-t border-border">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
            <span>© {currentYear} Humble</span>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="/legal?tab=privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/legal?tab=terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href="https://founder.myndlabs.tech" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Built by Yethikrishna R</a>
          </div>

          <div className="flex items-center gap-1.5">
            {/* GitHub */}
            <a href="https://github.com/yethikrishna/humble" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
              className="flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" className="size-3" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/yethikrishna-r-313530201" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
              className="flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" className="size-3" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            {/* X */}
            <a href="https://x.com/yethikrishna_r" target="_blank" rel="noopener noreferrer" aria-label="X"
              className="flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" className="size-3" fill="currentColor">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
            {/* Theme */}
            <button
              onClick={() => mounted && setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              suppressHydrationWarning
            >
              <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning={true}>
                {mounted && resolvedTheme === 'dark' ? (
                  <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>
                ) : (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
