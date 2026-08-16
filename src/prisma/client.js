const { PrismaClient } = require('@prisma/client');
const env = require('../config/env');

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = encodeURIComponent(env.db.user);
  const password = encodeURIComponent(env.db.password || '');
  const host = env.db.host;
  const port = env.db.port;
  const database = env.db.name;
  let url = `postgresql://${user}:${password}@${host}:${port}/${database}`;

  if (env.db.ssl) {
    url += '?sslmode=require';
  }

  return url;
}

process.env.DATABASE_URL = buildDatabaseUrl();

const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
