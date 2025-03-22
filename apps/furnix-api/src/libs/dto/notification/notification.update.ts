import { Field, InputType } from '@nestjs/graphql';
import { NotificationStatus } from '../../enums/notification.enum';
import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';

@InputType()
export class NotificationUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsNotEmpty()
	@Field(() => NotificationStatus)
	notificationStatus: NotificationStatus;
}
