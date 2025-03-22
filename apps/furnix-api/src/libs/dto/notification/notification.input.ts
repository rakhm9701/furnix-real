import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';

@InputType()
export class NotificationInput {
	@IsNotEmpty()
	@Field(() => NotificationType)
	notificationType: NotificationType;

	@IsNotEmpty()
	@Field(() => NotificationStatus)
	notificationStatus: NotificationStatus;

	@IsNotEmpty()
	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup;

	@IsNotEmpty()
	@Field(() => String)
	notificationTitle: String;

	@IsNotEmpty()
	@Field(() => String)
	notificationDesc: String;

	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	authorId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	receiverId: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productId?: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	articleId?: ObjectId;
}
