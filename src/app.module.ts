import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseAuthModule } from './firebase/firebase-auth.module';
import { APP_GUARD } from '@nestjs/core';
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
import { TransactionModule } from './transaction/transaction.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './utils/jwt-auth.guard';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
      global: true,
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
    TransactionModule,
    UtilsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
