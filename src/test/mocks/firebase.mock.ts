jest.mock('firebase-admin', () => ({
  ...jest.mock('firebase-admin'),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
}));

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn().mockReturnValueOnce({
    send: jest.fn(),
  }),
}));
