const dotenv = require('dotenv').config({ override: true });
import * as dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenv);
// console.log('Details:: ', dotenv);
/**
 * Environments variables declared here.
 */

/* eslint-disable node/no-process-env */

export default {
  NodeEnv: process.env.NODE_ENV ?? '',
  Port: process.env.PORT ?? 1337,
  BASE_URL: 'api',
  MONGO_URI: process.env.MONGO_URI ?? '',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
} as const;
