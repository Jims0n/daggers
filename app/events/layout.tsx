import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Frat Night at Spiffy\'s House | July 3rd, 2026',
  description: 'One last party. One last night. Same community. Get your tickets now.',
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
