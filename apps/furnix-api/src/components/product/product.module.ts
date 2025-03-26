import { Module } from '@nestjs/common';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import ProductSchema from '../../schemas/Product.model';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';
import { NotificationModule } from '../../notification/notification.module';
import { SocketGateway } from '../../socket/socket.gateway';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Product',
				schema: ProductSchema,
			},
		]),
		AuthModule,
		ViewModule,
		MemberModule,
		LikeModule,
		NotificationModule,
	],
	providers: [
		ProductResolver,
		ProductService,
		SocketGateway,
		{
			provide: 'SOCKET_GATEWAY',
			useExisting: SocketGateway,
		},
	],
	exports: [ProductService],
})
export class ProductModule {}
