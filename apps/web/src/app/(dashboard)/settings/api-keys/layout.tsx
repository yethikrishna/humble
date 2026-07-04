import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Keys | Humble',
  description: 'Manage your API keys for programmatic access to Humble',
  openGraph: {
    title: 'API Keys | Humble',
    description: 'Manage your API keys for programmatic access to Humble',
    type: 'website',
  },
};

export default async function APIKeysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
