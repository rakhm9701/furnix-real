import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthGuard } from '../components/auth/guards/auth.guard';
import { NotificationT } from '../libs/dto/notification/notification';
import { AuthMember } from '../components/auth/decorators/authMember.decorator';
import { NotificationService } from './notification.service';
import { ObjectId } from 'mongoose';


@Resolver()
export class Notification {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Query(() => [NotificationT])
	public async getNotifications(@AuthMember('_id') memberId: ObjectId): Promise<NotificationT[]> {
		console.log('Query: getNotifications for', memberId);
		return await this.notificationService.checkNotification(memberId);
	}
}
