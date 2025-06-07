import { Global, Module } from '@nestjs/common';
import Stripe from 'stripe';

@Global()
@Module({
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: () => {
        return new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-05-28.basil',
        });
      },
    },
  ],
  exports: ['STRIPE_CLIENT'],
})
export class StripeModule {}
