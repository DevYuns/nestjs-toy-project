import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentResovler } from './payments.resolver';
import { PaymentService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentResovler, PaymentService],
})
export class PaymentsModule {}
