import * as firebase from 'firebase-admin';

export class FirebaseAdminService {
  private static app: firebase.app.App;

  static getApp(): firebase.app.App {
    if (!this.app) {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);

      this.app = firebase.initializeApp(
        {
          credential: firebase.credential.cert(firebaseConfig),
        },
        'account',
      );
    }
    return this.app;
  }

  static getAuth(): firebase.auth.Auth {
    return this.getApp().auth();
  }
}
