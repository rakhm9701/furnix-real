import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import NotificationSchema from '../schemas/Notification.model';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }])],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}