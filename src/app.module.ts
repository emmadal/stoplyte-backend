import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseAuthModule } from './firebase/firebase-auth.module';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from './firebase/firebase-auth.guard';
import { AccountsModule } from './accounts/accounts.module';
import { PrismaModule } from './database/prisma.module';
import { PropertiesModule } from './properties/properties.module';
import { BuyersModule } from './buyers/buyers.module';
import { StorageModule } from './storage/storage.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AdminsModule } from './admin/admin.module';
import { PartnersModule } from './partners/partners.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    FirebaseAuthModule,
    PrismaModule,
    AccountsModule,
    PropertiesModule,
    BuyersModule,
    StorageModule,
    AdminsModule,
    PartnersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
