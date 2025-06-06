import { Global, Module } from '@nestjs/common';
import { FirebaseAuthStrategy } from './firebase-auth.strategy';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Global()
@Module({
  providers: [FirebaseAuthStrategy, FirebaseAuthGuard],
  exports: [FirebaseAuthStrategy, FirebaseAuthGuard],
})
export class FirebaseAuthModule {}
