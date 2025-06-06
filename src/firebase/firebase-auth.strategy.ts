import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as firebase from 'firebase-admin';
import { PrismaService } from '../database/prisma.service';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase-auth',
) {
  public static firebaseApp: firebase.app.App;
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
    const firebaseConfig = process.env.FIREBASE_ADMIN_CONFIG;
    if (!firebaseConfig) {
      throw new Error('FIREBASE_ADMIN_CONFIG environment variable is not set');
    }
    const firebase_params = JSON.parse(firebaseConfig);

    if (!FirebaseAuthStrategy.firebaseApp) {
      FirebaseAuthStrategy.firebaseApp = firebase.initializeApp({
        credential: firebase.credential.cert(firebase_params),
      });
    }
  }
  async validate(token: string) {
    const firebaseUser: any = await FirebaseAuthStrategy.firebaseApp
      .auth()
      .verifyIdToken(token, true)
      .catch((err) => {
        console.log(err);
        throw new UnauthorizedException(err.message);
      });
    if (!firebaseUser) {
      throw new UnauthorizedException();
    }

    firebaseUser.roles = [
      await AccountsService.getUserRole(firebaseUser.uid, this.prismaService),
    ];

    return firebaseUser;
  }
}
