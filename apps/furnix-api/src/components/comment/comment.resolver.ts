import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { ObjectId } from 'mongoose';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { shapeOfMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class CommentResolver {
	constructor(private readonly commentService: CommentService) {}
	//createComment
	@UseGuards(AuthGuard)
	@Mutation((returns) => Comment)
	public async createComment(
		@Args('input') input: CommentInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Comment> {
		console.log('Mutation: createComment');
		return await this.commentService.createComment(memberId, input);
	}

	// //updateComment
	@UseGuards(AuthGuard)
	@Mutation((returns) => Comment)
	public async updateComment(
		@Args('input') input: CommentUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Comment> {
		console.log('Mutation: updateComment');
		input._id = shapeOfMongoObjectId(input._id);
		return await this.commentService.updateComment(memberId, input);
	}

	//getComments
	@UseGuards(WithoutGuard)
	@Query((returns) => Comments)
	public async getComments(
		@Args('input') input: CommentsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Comments> {
		console.log('Query: getComments');
		// input.search.commentRefId = shapeOfMongoObjectId(input.search.commentRefId);
		if (input.search && input.search.commentRefId) {
			try {
				input.search.commentRefId = shapeOfMongoObjectId(input.search.commentRefId);
			} catch (error) {
				console.error('Invalid commentRefId format:', error);
				throw new Error('Invalid commentRefId format. Must be a valid ObjectId');
			}
		}
		const result = await this.commentService.getComments(memberId, input);
		return result;
	}

	//** ADMIN **/
	//removeCommentByAdmin
	@Roles(MemberType.ADMIN)
	@UseGuards(AuthGuard)
	@Mutation((returns) => Comment)
	public async removeCommentByAdmin(@Args('commentId') input: string): Promise<Comment> {
		console.log('Mutation: removeCommentByAdmin');
		const commentId = shapeOfMongoObjectId(input);
		return await this.commentService.removeCommentByAdmin(commentId);
	}
}
