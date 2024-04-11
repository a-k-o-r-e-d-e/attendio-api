const dotenv = require('dotenv').config({ override: true });
import * as dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenv);
/**
 * Environments variables declared here.
 */

/* eslint-disable node/no-process-env */

export default {
  NodeEnv: process.env.NODE_ENV ?? 'development',
  Port: process.env.PORT ?? 1337,
  BASE_URL: 'api',
  MONGO_URI: process.env.MONGO_URI ?? '',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME ?? '8h',
  FIREBASE_CONFIG: {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  },
} as const;
