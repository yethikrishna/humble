import type { Metadata } from 'next';
import FactoryPageClient from './factory-client';

export const metadata: Metadata = {
  title: 'The Autonomy Factory',
  description:
    'We build self-driving companies. The playbook for migrating from human-operated to AI-operated. 76% agents, 24% humans.',
  keywords:
    'Humble, autonomous company, self-driving company, AI-operated, autonomy factory, agent workforce, playbook, company automation',
  openGraph: {
    title: 'The Autonomy Factory — Humble',
    description:
      'We build self-driving companies. The playbook for migrating from human-operated to AI-operated. 76% agents, 24% humans.',
    url: 'https://humble.yethikrishnar.pw/factory',
    images: [
      {
        url: '/images/founder.jpg',
        width: 1200,
        height: 675,
        alt: 'Yethikrishna R',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Autonomy Factory — Humble',
    description:
      'We build self-driving companies. The playbook for migrating from human-operated to AI-operated. 76% agents, 24% humans.',
    images: ['/images/founder.jpg'],
  },
  alternates: {
    canonical: 'https://humble.yethikrishnar.pw/factory',
  },
};

export default function FactoryPage() {
  return <FactoryPageClient />;
}
