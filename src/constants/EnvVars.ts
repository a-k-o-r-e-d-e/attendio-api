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
    type: process.env.FIREBASE_TYPE, 
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  },
} as const;
