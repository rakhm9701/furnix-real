import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MemberService } from '../member/member.service';
import { ProductService } from '../product/product.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { Model, ObjectId } from 'mongoose';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { T } from '../../libs/types/common';
import { lookupMember } from '../../libs/config';
import { NotificationService } from '../../notification/notification.service';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { SocketGateway } from '../../socket/socket.gateway';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment>,
		@Inject('SOCKET_GATEWAY') private readonly socketGateway: SocketGateway,
		private readonly memberService: MemberService,
		private readonly productService: ProductService,
		private readonly boardArticleService: BoardArticleService,
		private notificationService: NotificationService,
	) {}
	//createComment
	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		input.memberId = memberId;

		let result = null;
		try {
			result = await this.commentModel.create(input);
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		switch (input.commentGroup) {
			case CommentGroup.PRODUCT:
				await this.productService.productStatsEditor({
					_id: input.commentRefId,
					targetKey: 'productComments',
					modifier: 1,
				});

				const product = await this.productService.getProduct(null, input.commentRefId);
				if (product) {
					const notificationInput: NotificationInput = {
						notificationType: NotificationType.COMMENT,
						notificationGroup: NotificationGroup.PRODUCT,
						notificationTitle: 'Comment',
						notificationDesc: 'Product Commented!',
						notificationStatus: NotificationStatus.WAIT,
						memberId: memberId,
						authorId: product.memberId,
						receiverId: product.memberId,
						productId: product._id,
					};
					const notification: any = await this.notificationService.createNotification(notificationInput);

					const clientId = product.memberId.toString(); // Ensure _id exists
					await this.socketGateway.sendNotification(clientId, [notification]);
				}
				break;

			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});

				const boardArticle = await this.boardArticleService.getBoardArticle(null, input.commentRefId);
				console.log('boardarticle error:', boardArticle);
				if (boardArticle) {
					const notificationInput: NotificationInput = {
						notificationType: NotificationType.COMMENT,
						notificationGroup: NotificationGroup.ARTICLE,
						notificationTitle: 'Comment',
						notificationDesc: 'Article Commented!',
						notificationStatus: NotificationStatus.WAIT,
						memberId: memberId,
						authorId: boardArticle.memberId,
						receiverId: boardArticle.memberId,
						articleId: boardArticle._id,
					};
					const notification: any = await this.notificationService.createNotification(notificationInput);

					const clientId = boardArticle.memberId.toString(); // Ensure _id exists
					await this.socketGateway.sendNotification(clientId, [notification]);
				}
				break;

			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});
				break;
		}

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}

	//updateComment
	public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
		const { _id } = input;
		const result = await this.commentModel
			.findOneAndUpdate(
				{
					_id: _id,
					memberId: memberId,
					commentStatus: CommentStatus.ACTIVE,
				},
				input,
				{
					new: true,
				},
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILE);
		return result;
	}

	// //updateComments
	public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const { commentRefId } = input.search;
		const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result: Comments[] = await this.commentModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							//meLiked
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.N0_DATA_FOUND);

		return result[0];
	}

	//** ADMIN **/
	//removeCommentByAdmin
	public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
		const result = await this.commentModel.findByIdAndDelete(input);
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILE);
		return result;
	}
}
