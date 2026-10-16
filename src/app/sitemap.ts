import type { MetadataRoute } from 'next';
import { company } from '@/config/company';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap { return company.siteUrl ? [{url: company.siteUrl}] : []; }
