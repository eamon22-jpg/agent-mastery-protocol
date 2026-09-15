import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000/',
);
const socialImageUrl = new URL('og.png', `${siteUrl.toString().replace(/\/?$/, '/')}`);

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sentinel - Agent Mastery Reward',
  description:
    'An interactive gray and gold prestige sentry earned through agent mastery.',
  metadataBase: siteUrl,
  openGraph: {
    title: 'Sentinel - Agent Mastery Reward',
    description: 'Explore a gray and gold prestige sentry in an interactive 3D gallery.',
    images: [{ url: socialImageUrl.toString(), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sentinel - Agent Mastery Reward',
    description: 'Explore a gray and gold prestige sentry in an interactive 3D gallery.',
    images: [socialImageUrl.toString()],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
