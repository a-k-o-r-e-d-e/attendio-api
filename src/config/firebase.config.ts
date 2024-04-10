import * as firebaseAdmin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import EnvVars from '../constants/EnvVars';

const config = {
  credential: firebaseAdmin.credential.cert(EnvVars.FIREBASE_CONFIG as any),
};

/// set up firebase
const firebaseApp = firebaseAdmin.initializeApp({
  credential: config.credential,
  databaseURL: 'https://milk-meets-honey-default-rtdb.firebaseio.com',
});

export const FirebaseMessaging = getMessaging();
