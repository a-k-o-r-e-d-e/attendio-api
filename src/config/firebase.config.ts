import * as firebaseAdmin from 'firebase-admin';
import * as firebaseMessaging from 'firebase-admin/messaging';
import EnvVars from '../constants/EnvVars';

console.log('EnvVars::', EnvVars.FIREBASE_CONFIG);

/// set up firebase
const firebaseApp = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: EnvVars.FIREBASE_CONFIG.project_id,
    privateKey: EnvVars.FIREBASE_CONFIG.private_key,
    clientEmail: EnvVars.FIREBASE_CONFIG.client_email,
  }),
});

export const FirebaseMessaging = firebaseMessaging.getMessaging(firebaseApp);
