import type { Brand } from './types';

// Same deployment, two front doors. Both brands share one visual system
// (y0's logo/asset files, already in public/) and one dashboard — they
// differ in product name, marketing copy, and nav/footer content only.

const Y0_URL = process.env.NEXT_PUBLIC_Y0_APP_URL || 'https://y0-app.vercel.app';
const HUMBLE_URL =
  process.env.NEXT_PUBLIC_HUMBLE_APP_URL || 'https://humble.yethikrishnar.pw';

export const y0Brand: Brand = {
  id: 'y0',
  name: 'y0',
  title: 'y0 – Your Autonomous AI Workforce',
  description:
    'Deploy intelligent AI agents that think, plan, and execute complex tasks autonomously. From research to coding to automation – y0 delivers real results.',
  keywords:
    'y0, autonomous AI agents, AI workforce, AI automation platform, agentic AI, intelligent agents, task automation, AI assistant, autonomous workers, AI coding assistant, research automation',
  url: Y0_URL,
  heroDescription:
    'y0 – Your autonomous AI workforce. Deploy intelligent agents that think, act, and deliver real results.',
  launchCta: 'Launch y0',
  githubUrl: 'https://github.com/yethikrishna/y0',
  nav: {
    links: [
      { id: 1, name: 'y0', href: '/' },
      { id: 2, name: 'Humble', href: HUMBLE_URL, external: true },
      { id: 3, name: 'About', href: '/about' },
      { id: 4, name: 'Careers', href: '/careers' },
    ],
  },
  footerLinks: [
    {
      title: 'y0',
      links: [
        { id: 1, title: 'About', url: '/about' },
        { id: 2, title: 'Careers', url: '/careers' },
        { id: 3, title: 'Contact', url: 'mailto:yethikrishnarcvn7a@gmail.com' },
        { id: 4, title: 'Humble Platform', url: HUMBLE_URL },
      ],
    },
    {
      title: 'Resources',
      links: [
        { id: 5, title: 'X', url: 'https://x.com/yethikrishna_r' },
        { id: 6, title: 'GitHub', url: 'https://github.com/yethikrishna/y0' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { id: 7, title: 'Privacy Policy', url: '/legal?tab=privacy' },
        { id: 8, title: 'Terms of Service', url: '/legal?tab=terms' },
        { id: 9, title: 'License', url: 'https://github.com/yethikrishna/y0/blob/main/LICENSE' },
      ],
    },
  ],
};

export const humbleBrand: Brand = {
  id: 'humble',
  name: 'Humble',
  title: 'Humble – The Autonomous Company Operating System',
  description:
    'A cloud computer where AI agents run your company. Connect 3,000+ tools, configure autonomous agents, set triggers — and the machine operates 24/7 with persistent memory.',
  keywords:
    'Humble, y0, autonomous company operating system, AI agents, self-driving company, cloud computer, AI automation, agent orchestration, autowork, AI triggers, persistent memory, autonomous workforce, AI operations',
  url: HUMBLE_URL,
  heroDescription:
    'Humble – the open-source operating system for running autonomous companies.',
  launchCta: 'Launch Humble',
  githubUrl: 'https://github.com/yethikrishna/humble',
  nav: {
    links: [
      { id: 1, name: 'Humble', href: '/' },
      { id: 2, name: 'y0', href: Y0_URL, external: true },
      { id: 3, name: 'About', href: '/about' },
      { id: 4, name: 'Careers', href: '/careers' },
    ],
  },
  footerLinks: [
    {
      title: 'Humble',
      links: [
        { id: 1, title: 'About', url: '/about' },
        { id: 2, title: 'Careers', url: '/careers' },
        { id: 3, title: 'Support', url: '/support' },
        { id: 4, title: 'y0 Platform', url: Y0_URL },
        { id: 5, title: 'Contact', url: 'mailto:yethikrishnarcvn7a@gmail.com' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { id: 6, title: 'Tutorials', url: '/tutorials' },
        { id: 7, title: 'Documentation', url: '/docs' },
        { id: 8, title: 'X', url: 'https://x.com/yethikrishna_r' },
        { id: 9, title: 'GitHub', url: 'https://github.com/yethikrishna/humble' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { id: 10, title: 'Privacy Policy', url: '/legal?tab=privacy' },
        { id: 11, title: 'Terms of Service', url: '/legal?tab=terms' },
        { id: 12, title: 'License', url: 'https://github.com/yethikrishna/humble/blob/main/LICENSE' },
      ],
    },
  ],
};

export const DEFAULT_BRAND = humbleBrand;

export const BRANDS_BY_ID: Record<Brand['id'], Brand> = {
  y0: y0Brand,
  humble: humbleBrand,
};

/**
 * y0's own hostnames, matched against the request Host header to pick the
 * brand. Anything not matching here falls back to Humble (DEFAULT_BRAND).
 * Override/extend via NEXT_PUBLIC_Y0_HOSTNAMES (comma-separated) for custom
 * domains without a code change.
 */
function getY0Hostnames(): string[] {
  const fromEnv = (process.env.NEXT_PUBLIC_Y0_HOSTNAMES || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  return [
    'y0-app.vercel.app',
    'y0.yethikrishnar.pw',
    ...fromEnv,
  ];
}

export function getBrandForHost(host: string | null | undefined): Brand {
  if (!host) return DEFAULT_BRAND;
  const hostname = host.split(':')[0].toLowerCase();
  const y0Hostnames = getY0Hostnames();
  if (y0Hostnames.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
    return y0Brand;
  }
  return DEFAULT_BRAND;
}
