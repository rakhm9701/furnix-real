import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NotificationInput } from '../libs/dto/notification/notification.input';
import { Message } from '../libs/enums/common.enum';
import { NotificationStatus } from '../libs/enums/notification.enum';
import { NotificationT } from '../libs/dto/notification/notification';
import { shapeOfMongoObjectId } from '../libs/config';

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

	public async readNotificatio(notificationId: ObjectId, status: NotificationStatus): Promise<NotificationT> {
		const notification = await this.notificationModel.findByIdAndUpdate(
			notificationId,
			{ notificationStatus: status },
			{ new: true },
		);

		if (!notification) {
			throw new Error('Notification not found');
		}

		// Agar memberId null bo'lsa, default qiymat berish
		if (!notification.memberId) {
			notification.memberId = shapeOfMongoObjectId('000000000000000000000000');
		}

		return notification;
	}

	public async allReadNotification(memberId: ObjectId, notificationStatus: NotificationStatus): Promise<string> {
		await this.notificationModel
			.updateMany({ receiverId: memberId }, { $set: { notificationStatus: notificationStatus } })
			.exec();
		return 'succed';
	}
}