import type { Metadata } from 'next';
import './fonts.css';
import './globals.css';
import './brand.css';
import './responsive.css';
import { company } from '@/config/company';
export const metadata: Metadata = {
  metadataBase: company.siteUrl ? new URL(company.siteUrl) : undefined,
  alternates: company.siteUrl ? { canonical: company.siteUrl } : undefined,
  title: 'Shree Sudhya | Premium Laundry & Fabric Care',
  description: 'Premium care for every fabric. Discover Shree Sudhya Laundry Services, where cleanliness meets care and freshness is in every fold.',
  openGraph: { title: 'Shree Sudhya Laundry Services', description: 'Premium care for every fabric.', images: company.siteUrl ? ['/images/brand-banner.jpeg'] : [] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body>{children}</body></html>;
}
