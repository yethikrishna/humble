import type { Metadata } from 'next';
import AboutPageClient from './about-client';

export const metadata: Metadata = {
  title: 'About',
  description:
    'We build self-driving companies. 76% agents, 24% humans — where humans verify, steer, and govern. Agents do the work. Full agent teams doing engineering, product, operations, finance, support, and growth.',
  keywords:
    'Humble, about Humble, self-driving company, AI-operated company, autonomous operations, agent workforce, AI agents, company automation',
  openGraph: {
    title: 'About Humble – Building Self-Driving Companies',
    description:
      'We take process-heavy companies and turn them into AI-operated ones. Full agent teams doing engineering, product, operations, finance, support, and growth.',
    url: 'https://humble.yethikrishnar.pw/about',
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
    title: 'About Humble – Building Self-Driving Companies',
    description:
      'We take process-heavy companies and turn them into AI-operated ones. Full agent teams doing engineering, product, operations, finance, support, and growth.',
    images: ['/images/founder.jpg'],
  },
  alternates: {
    canonical: 'https://humble.yethikrishnar.pw/about',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
