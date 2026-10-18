/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/**': ['./prisma/dev.db', './prisma/seed-data.json'],
      '/portal/**': ['./prisma/dev.db', './prisma/seed-data.json'],
      '/ops/**': ['./prisma/dev.db', './prisma/seed-data.json'],
      '/**': ['./prisma/dev.db', './prisma/seed-data.json'],
    },
  },
};

export default nextConfig;
