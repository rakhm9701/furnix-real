// src/modules/faq/faq.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqService } from './faq.service';
import { FaqResolver } from './faq.resolver';
import { AuthModule } from '../auth/auth.module';
import NoticeSchema from '../../schemas/Notice.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notice', schema: NoticeSchema }  // Register Notice model
    ]),
    AuthModule, 
  ],
  providers: [FaqService, FaqResolver],
  exports: [FaqService],
})
export class FaqModule {}