import type { Metadata } from 'next';
import PartnershipsPageClient from './partnerships-client';

export const metadata: Metadata = {
  title: 'Partnerships',
  description:
    'Work with Humble to build autonomous operations for your company. The Humble team comes in on retainer and builds the same systems we run ourselves — end-to-end, embedded in your operations.',
  keywords:
    'Humble partnerships, AI implementation partner, autonomous operations consulting, agent teams, AI workforce deployment, enterprise AI, joint venture AI',
  openGraph: {
    title: 'Partnerships – Humble',
    description:
      'A handful of selected companies. $20k/month retainer. We come in and build autonomous operations with you — the same way we run our own.',
    url: 'https://humble.yethikrishnar.pw/partnerships',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partnerships – Humble',
    description:
      'A handful of selected companies. $20k/month retainer. We come in and build autonomous operations with you — the same way we run our own.',
  },
  alternates: {
    canonical: 'https://humble.yethikrishnar.pw/partnerships',
  },
};

export default function PartnershipsPage() {
  return <PartnershipsPageClient />;
}
