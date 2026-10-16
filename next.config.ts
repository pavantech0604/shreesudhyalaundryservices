import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', images: { unoptimized: true }, devIndicators: false, experimental: { cpus: 2, memoryBasedWorkersCount: true } };
export default config;
