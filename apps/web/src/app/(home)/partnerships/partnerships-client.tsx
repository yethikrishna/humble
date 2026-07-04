'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/home/reveal';

const CONTACT_EMAIL = 'yethikrishnarcvn7a@gmail.com';

export default function PartnershipsPageClient() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 pt-24 sm:pt-32 pb-24 sm:pb-32">

        {/* Hero */}
        <Reveal>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-5">
            Partnerships
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            We work with a handful of selected companies to build autonomous operations — the same way we build them for ourselves. Humble leadership and engineers, embedded with your team.
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mt-4">
            We learn from every engagement. That knowledge feeds back into everything we build. You get your operations actually automated — by the team that does this every day for their own companies. Our full methodology, knowledge, and processes — shared openly.
          </p>
        </Reveal>

        {/* Price */}
        <Reveal delay={0.2}>
          <div className="mt-14 p-6 rounded-lg border border-border bg-muted/5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Monthly Retainer
            </p>
            <p className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
              $20,000<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Humble leadership and engineers embedded with your team. Cancel anytime.
            </p>
          </div>
        </Reveal>

        {/* How it works */}
        <Reveal>
          <div className="mt-14">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
              How It Works
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phase 1</p>
                <p className="text-base font-medium text-foreground">Understand</p>
                <p className="text-base text-muted-foreground leading-relaxed mt-1.5">
                  We go deep. We talk to you, your team, your operators. We map every process — inputs, outputs, the black boxes where humans are doing repetitive work day-to-day. What{"'"}s actually happening, not what the org chart says.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phase 2</p>
                <p className="text-base font-medium text-foreground">Build & Deploy</p>
                <p className="text-base text-muted-foreground leading-relaxed mt-1.5">
                  We build autonomous operations on Humble — agents, automations, autonomous teams — wired into your tools and data. Fully deployed, in production. This requires low politics, low bureaucracy, and real access. Credentials, systems, green lights. We need ownership to move. This is a partnership, not a consulting engagement.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ongoing</p>
                <p className="text-base font-medium text-foreground">Operate & Expand</p>
                <p className="text-base text-muted-foreground leading-relaxed mt-1.5">
                  We stay. Optimizing what{"'"}s running, expanding into new workflows, increasing autonomy — progressively replacing manual process with systems that run themselves.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="mt-14 pt-8 border-t border-border">
            <p className="text-base text-muted-foreground leading-relaxed">
              Also open to joint ventures and deeper structures beyond a retainer.
            </p>

            <Button
              size="lg"
              className="h-11 px-6 mt-5 text-sm rounded-full"
              asChild
            >
              <a href={`mailto:${CONTACT_EMAIL}`}>
                Get in touch<ArrowRight className="ml-1.5 size-3.5" />
              </a>
            </Button>

            <div className="flex flex-col gap-1.5 mt-5">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-base text-foreground hover:text-foreground underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground/50 transition-colors w-fit"
              >
                {CONTACT_EMAIL}
              </a>
              <a
                href="https://x.com/yethikrishna_r"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-foreground hover:text-foreground underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground/50 transition-colors w-fit"
              >
                @yethikrishna_r
              </a>
              <a
                href="https://www.linkedin.com/in/yethikrishna-r-313530201"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-foreground hover:text-foreground underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground/50 transition-colors w-fit"
              >
                linkedin.com/in/yethikrishna-r-313530201
              </a>
            </div>
          </div>
        </Reveal>

        {/* Bottom spacing for floating CTA clearance */}
        <div className="h-20" />
      </div>
    </main>
  );
}
