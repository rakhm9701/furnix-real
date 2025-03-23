import { Module } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { ProductModule } from '../product/product.module';
import { BoardArticleModule } from '../board-article/board-article.module';
import { NotificationModule } from '../../notification/notification.module';
import { SocketModule } from '../../socket/socket.module';
import { SocketGateway } from '../../socket/socket.gateway';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Comment',
				schema: CommentSchema,
			},
		]),
		AuthModule,
		MemberModule,
		ProductModule,
		BoardArticleModule,
		NotificationModule,
		SocketModule,
	],

	providers: [
		CommentResolver,
		CommentService,
		SocketGateway,
		{
			provide: 'SOCKET_GATEWAY',
			useExisting: SocketGateway,
		},
	],
	exports: [CommentService],
})
export class CommentModule {}
