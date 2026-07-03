// The y0 platform — Humble's sibling product. The two apps present as one
// SaaS with two product tabs; this URL powers the "y0" tab in the nav.
export const Y0_APP_URL =
  process.env.NEXT_PUBLIC_Y0_APP_URL || 'https://y0-app.vercel.app';

export const siteConfig = {
  url: process.env.KORTIX_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  nav: {
    links: [
      { id: 1, name: 'Humble', href: '/' },
      { id: 2, name: 'y0', href: Y0_APP_URL, external: true },
      { id: 3, name: 'About', href: '/about' },
      { id: 4, name: 'Careers', href: '/careers' },
      // { id: 5, name: 'Partnerships', href: '/partnerships' },
    ],
  },
  hero: {
    description:
      'Humble – the open-source operating system for running autonomous companies.',
  },
  footerLinks: [
    {
      title: 'Humble',
      links: [
        { id: 1, title: 'About', url: '/about' },
        { id: 2, title: 'Careers', url: '/careers' },
        // { id: 3, title: 'Partnerships', url: '/partnerships' },
        { id: 4, title: 'Support', url: '/support' },
        { id: 5, title: 'y0 Platform', url: Y0_APP_URL },
      ],
    },
    {
      title: 'Resources',
      links: [
        { id: 6, title: 'Tutorials', url: '/tutorials' },
        { id: 7, title: 'Documentation', url: '/docs' },
        { id: 8, title: 'Discord', url: 'https://discord.com/invite/RvFhXUdZ9H' },
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

export type SiteConfig = typeof siteConfig;
