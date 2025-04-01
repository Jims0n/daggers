import Header from '@/components/shared/header';
import Footer from '@/components/footer';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: '/images/logo.svg',
    apple: '/images/logo.svg',
  },
};

export default function RootLayout({
  children,
}: PropsWithChildren) {
  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <Header />
      <main className='flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8'>
        {children}
      </main>
      <Footer />
    </div>
  );
}