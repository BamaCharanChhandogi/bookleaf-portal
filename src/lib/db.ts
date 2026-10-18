import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getOrSetupDatabase(): string {
  // If explicitly provided via env (e.g. remote DB or custom SQLite path)
  if (process.env.DATABASE_URL && !process.env.VERCEL) {
    return process.env.DATABASE_URL;
  }

  // On Vercel serverless environment, the lambda deployment filesystem (/var/task) is read-only.
  // SQLite strictly requires a writable filesystem for journals and lock files.
  // We copy the bundled dev.db into /tmp/dev.db where serverless functions have full read/write access.
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const tmpDir = process.env.TMPDIR || '/tmp';
    const tmpDbPath = path.join(tmpDir, 'dev.db');

    if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
      console.log('[Database] Initializing writable database in /tmp...');

      const searchPaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.join('/var/task', 'prisma', 'dev.db'),
        path.resolve('./prisma/dev.db'),
      ];

      let found = false;
      for (const p of searchPaths) {
        try {
          if (fs.existsSync(p) && fs.statSync(p).size > 0) {
            fs.copyFileSync(p, tmpDbPath);
            console.log(`[Database] Successfully copied seeded DB from ${p} to ${tmpDbPath} (${fs.statSync(tmpDbPath).size} bytes)`);
            found = true;
            break;
          }
        } catch (err) {
          console.error(`[Database] Failed copying from ${p}:`, err);
        }
      }

      if (!found) {
        console.warn('[Database] Seeded dev.db not found in search paths. Creating placeholder in /tmp.');
        try {
          fs.writeFileSync(tmpDbPath, '');
        } catch (e) {
          console.error('[Database] Could not write to /tmp/dev.db:', e);
        }
      }
    }

    const resolvedUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = resolvedUrl;
    return resolvedUrl;
  }

  // Local development fallback
  const localDb = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDb}`;
}

const dbUrl = getOrSetupDatabase();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: dbUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
