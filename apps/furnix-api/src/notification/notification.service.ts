import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NotificationInput } from '../libs/dto/notification/notification.input';
import { Message } from '../libs/enums/common.enum';
import { NotificationStatus } from '../libs/enums/notification.enum';
import { NotificationT } from '../libs/dto/notification/notification';

@Injectable()
export class NotificationService {
 constructor(@InjectModel('Notification') private readonly notificationModel: Model<NotificationT>) {}

 public async createNotification(input: NotificationInput): Promise<NotificationT> {
  try {
   return await this.notificationModel.create(input);
  } catch (err) {
   throw new InternalServerErrorException(Message.CREATE_FAILED);
  }
 }

 public async checkNotification(memberId: ObjectId): Promise<NotificationT[] | null> {
  const result = await this.notificationModel
   .find({ receiverId: memberId, notificationStatus: NotificationStatus.WAIT })
   .exec();
  return result.length ? result : null;
 }

 public async readNotification(
  notificationId: ObjectId,
  notificationStatus: NotificationStatus,
 ): Promise<NotificationT> {
  return await this.notificationModel
   .findOneAndUpdate({ _id: notificationId }, { notificationStatus: notificationStatus }, { new: true })
   .exec();
 }

 public async allReadNotification(memberId: ObjectId, notificationStatus: NotificationStatus): Promise<string> {
  await this.notificationModel
   .updateMany({ receiverId: memberId }, { $set: { notificationStatus: notificationStatus } })
   .exec();
  return 'succedd';
 }
}